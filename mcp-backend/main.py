from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from mcp_agent import chat_with_agent
import mysql.connector
from difflib import SequenceMatcher
import os
import openai


app = FastAPI()

# Habilitar CORS para permitir peticiones desde el frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Puedes restringir a ["http://localhost"] si lo prefieres
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Endpoint REST: listar/buscar usuarios
@app.get("/usuarios")
def listar_usuarios(q: str = ""):
    conn = mysql.connector.connect(
        host="localhost",
        user="root",
        password="",
        database="chatbot_tesis"
    )
    cursor = conn.cursor(dictionary=True)
    if q:
        cursor.execute("SELECT id, nombre, apellido FROM usuarios WHERE nombre LIKE %s OR apellido LIKE %s ORDER BY id DESC LIMIT 100", (f"%{q}%", f"%{q}%"))
        usuarios = cursor.fetchall()
        # Si no hay resultados, buscar similar
        if not usuarios:
            cursor.execute("SELECT nombre, apellido FROM usuarios")
            todos = cursor.fetchall()
            from difflib import SequenceMatcher
            mejor_similitud = 0
            mejor_nombre = None
            q_lower = q.lower()
            for n, a in todos:
                for campo in [n, a]:
                    similitud = SequenceMatcher(None, q_lower, campo.lower()).ratio()
                    if similitud > mejor_similitud:
                        mejor_similitud = similitud
                        mejor_nombre = campo
            if mejor_similitud > 0.7 and mejor_nombre:
                return {"usuarios": [], "sugerencia": mejor_nombre}
        return {"usuarios": usuarios}
    else:
        cursor.execute("SELECT id, nombre, apellido FROM usuarios ORDER BY id DESC LIMIT 100")
        usuarios = cursor.fetchall()
        cursor.close()
        conn.close()
        return {"usuarios": usuarios}

# Endpoint REST: alta usuario
@app.post("/usuarios")
async def alta_usuario(request: Request):
    data = await request.json()
    nombre = data.get("nombre", "").strip()
    apellido = data.get("apellido", "").strip()
    ignorar_duplicado = data.get("ignorar_duplicado", False)
    if not nombre or not apellido:
        return JSONResponse({"error": "Faltan nombre o apellido"}, status_code=400)
    # Validar duplicados (igual que en tools/sql_tool.py)
    conn = mysql.connector.connect(
        host="localhost",
        user="root",
        password="",
        database="chatbot_tesis"
    )
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT id, nombre, apellido FROM usuarios WHERE SOUNDEX(nombre) = SOUNDEX(%s) OR nombre LIKE %s OR apellido LIKE %s", (nombre, f"%{nombre}%", f"%{apellido}%"))
    usuarios = cursor.fetchall()
    nombre_apellido_nuevo = f"{nombre.lower()} {apellido.lower()}"
    similares = []
    for u in usuarios:
        nombre_apellido_existente = f"{u['nombre'].lower()} {u['apellido'].lower()}"
        similitud = SequenceMatcher(None, nombre_apellido_nuevo, nombre_apellido_existente).ratio()
        if similitud >= 0.9:  # Solo si nombre+apellido son MUY parecidos
            similares.append({
                "id": u["id"],
                "nombre": u["nombre"],
                "apellido": u["apellido"],
                "similitud": round(similitud, 2)
            })
    if similares and not ignorar_duplicado:
        cursor.close()
        conn.close()
        return JSONResponse({"error": "Posibles duplicados encontrados", "duplicados": similares, "advertencia": "¡Atención! Es posible que el usuario ya exista en la base de datos. Por favor, revise la lista de duplicados antes de proceder."}, status_code=409)

    # --- Validación IA OpenAI si está configurada ---
    openai_key = os.getenv('OPENAI_API_KEY')
    if openai_key:
        openai.api_key = openai_key
        usuarios_lista = [f"{u['nombre']} {u['apellido']}" for u in usuarios]
        prompt = (
            "Dada la siguiente lista de usuarios registrados en el sistema:\n" +
            "\n".join(f"- {u}" for u in usuarios_lista) +
            f"\n\n¿El nombre '{nombre} {apellido}' es un posible duplicado, variante, apodo o error de tipeo de alguno de los anteriores? Si detectas un error de tipeo, espacios, acentos, letras cambiadas, faltantes o invertidas, sugiere la corrección exacta (nombre y apellido corregido) en tu respuesta. Responde solo 'SI' o 'NO'. Si es 'SI', explica brevemente por qué en español y sugiere la corrección en el formato: SUGERENCIA: <nombre corregido> <apellido corregido>."
        )
        try:
            client = openai.Client()
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=64,
                temperature=0
            )
            gpt_reply = response.choices[0].message.content.strip().lower()
            if gpt_reply.startswith('si') or gpt_reply.startswith('sí'):
                sugerencia = None
                if 'sugerencia:' in gpt_reply:
                    try:
                        sugerencia = gpt_reply.split('sugerencia:')[1].strip().split('\n')[0]
                    except Exception:
                        sugerencia = None
                cursor.close()
                conn.close()
                return JSONResponse({
                    "error": "Posible duplicado IA detectado",
                    "duplicados": [],
                    "advertencia": f"¡Atención! La IA detectó un posible duplicado: {gpt_reply}",
                    "sugerencia": sugerencia
                }, status_code=409)
        except Exception as e:
            print('Error consultando OpenAI:', e)
    # Si no hay similares fuzzy ni IA, insertar
    cursor.execute("INSERT INTO usuarios (nombre, apellido) VALUES (%s, %s)", (nombre, apellido))
    conn.commit()
    cursor.close()
    conn.close()
    return {"success": True}

@app.post("/chat")
async def chat(request: Request):
    data = await request.json()
    user_message = data.get("message", "")
    response = await chat_with_agent(user_message)
    return {"response": response}

import openai

# Memoria de conversación para consultas
consulta_memory = {}

async def consulta_with_llm(user_message, session_id="consulta"):
    # Instrucciones para el LLM: solo responder sobre la base de usuarios, nunca sugerir alta ni confirmaciones
    system_prompt = (
        "Eres un asistente para consultas de base de datos de usuarios. "
        "Solo puedes responder preguntas sobre los usuarios existentes en la base de datos. "
        "Cuando recibas una pregunta, primero explica brevemente en español lo que vas a consultar. "
        "Si el usuario pide un nombre o apellido que no existe exactamente, pero hay algún nombre o apellido similar en la base de datos (por ejemplo, piden 'Martha' y existe 'Marta'), menciona la similitud en tu respuesta antes de pedir la consulta SQL. "
        "Por ejemplo, si el usuario pide 'listar las marthas' y solo existe 'Marta', responde: 'No encontré usuarios llamados Martha, pero hay una persona llamada Marta. ¿Quieres que la muestre?' "
        "Luego, en una nueva línea, pide al backend ejecutar la consulta SQL necesaria usando el formato: "
        "EJECUTAR_SQL: <consulta sql>. "
        "Ejemplo de respuesta: 'Para saber cuántos usuarios llamados Juan existen, consulto la base de datos.\nEJECUTAR_SQL: SELECT COUNT(*) FROM usuarios WHERE nombre = \"Juan\"' "
        "Nunca sugieras agregar usuarios, ni confirmaciones, ni sugerencias de alta. "
        "Responde solo con la información solicitada."
    )
    # Recuperar historial
    history = consulta_memory.get(session_id, [])
    # Construir mensajes para el LLM
    messages = [{"role": "system", "content": system_prompt}]
    for h in history:
        messages.append({"role": "user", "content": h["user"]})
        messages.append({"role": "assistant", "content": h["assistant"]})
    messages.append({"role": "user", "content": user_message})
    client = openai.Client()
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=messages,
        max_tokens=256,
        temperature=0.1
    )
    content = response.choices[0].message.content.strip()
    # Guardar en memoria el intercambio
    if session_id not in consulta_memory:
        consulta_memory[session_id] = []
    # Guardar solo el último user/assistant
    # (el assistant puede ser solo el resultado, no toda la explicación)
    import re
    match = re.search(r"EJECUTAR_SQL:(.*)", content)
    if match:
        sql = match.group(1).strip()
        conn = mysql.connector.connect(
            host="localhost",
            user="root",
            password="",
            database="chatbot_tesis"
        )
        cursor = conn.cursor()
        try:
            cursor.execute(sql)
            result = cursor.fetchall()
            # Si es un count, mostrar el número
            if re.match(r"select count\(\*\)", sql, re.IGNORECASE):
                count = result[0][0] if result else 0
                # --- Detectar similares si el resultado es 0 ---
                if count == 0:
                    # Buscar coincidencia similar en nombres
                    cursor.execute("SELECT nombre, apellido FROM usuarios")
                    todos = cursor.fetchall()
                    # Extraer nombre/apellido de la consulta SQL
                    import re as _re
                    nombre_apellido_consulta = "".join(sql.split("WHERE")[-1]).replace('nombre', '').replace('apellido', '').replace('=', '').replace('AND', '').replace('"', '').replace("'", '').replace(' ', '').lower()
                    mejor_similitud = 0
                    mejor_usuario = None
                    for n, a in todos:
                        nombre_apellido_existente = (n + a).replace(' ', '').lower()
                        similitud = SequenceMatcher(None, nombre_apellido_consulta, nombre_apellido_existente).ratio()
                        if similitud > mejor_similitud:
                            mejor_similitud = similitud
                            mejor_usuario = f"{n} {a}"
                    if mejor_similitud > 0.7:
                        msg = f"No se encontraron coincidencias exactas, pero existe un usuario similar: {mejor_usuario} (similitud: {mejor_similitud:.2f})"
                        consulta_memory[session_id].append({"user": user_message, "assistant": msg})
                        return {"similar": mejor_usuario, "result": msg}
                # Redactar respuesta bonita usando el LLM
                pretty_prompt = (
                    f"El usuario preguntó: '{user_message}'. "
                    f"El resultado crudo de la consulta es: {count}. "
                    "Redacta una respuesta clara y conversacional en español, explicando el resultado de forma natural. No uses formato de lista ni solo números, sino una frase completa."
                )
                pretty_response = client.chat.completions.create(
                    model="gpt-4o",
                    messages=[{"role": "system", "content": "Eres un asistente que redacta respuestas claras y naturales para resultados de consultas de usuarios."}, {"role": "user", "content": pretty_prompt}],
                    max_tokens=128,
                    temperature=0.5
                ).choices[0].message.content.strip()
                consulta_memory[session_id].append({"user": user_message, "assistant": pretty_response})
                return pretty_response
            # Si es un select nombre, apellido, mostrar lista
            elif re.match(r"select nombre, apellido", sql, re.IGNORECASE):
                if not result:
                    # Buscar coincidencia similar en nombres o apellidos
                    cursor.execute("SELECT nombre, apellido FROM usuarios")
                    todos = cursor.fetchall()
                    # Extraer término buscado de la consulta SQL (nombre o apellido)
                    import re as _re
                    where_match = _re.search(r"WHERE (.+?)(?: |$)", sql, _re.IGNORECASE)
                    buscado = ""
                    if where_match:
                        buscado = where_match.group(1)
                        buscado = buscado.replace('nombre', '').replace('apellido', '').replace('=', '').replace('AND', '').replace('"', '').replace("'", '').replace('%', '').replace(' ', '').lower()
                    mejor_similitud = 0
                    mejor_usuario = None
                    for n, a in todos:
                        for campo in [n, a]:
                            similitud = SequenceMatcher(None, buscado, campo.lower()).ratio()
                            if similitud > mejor_similitud:
                                mejor_similitud = similitud
                                mejor_usuario = f"{n} {a}"
                    if mejor_similitud > 0.7 and mejor_usuario:
                        msg = f"No se encontraron coincidencias exactas, pero existe un usuario similar: {mejor_usuario} (similitud: {mejor_similitud:.2f}). ¿Quieres continuar con {mejor_usuario}?"
                        consulta_memory[session_id].append({"user": user_message, "assistant": msg})
                        return {"similar": mejor_usuario, "result": msg}
                    else:
                        msg = "No se encontraron coincidencias ni usuarios similares."
                        consulta_memory[session_id].append({"user": user_message, "assistant": msg})
                        return msg
                # Redactar respuesta bonita usando el LLM para listados
                nombres = [f"{n} {a}" for n, a in result]
                nombres_str = ", ".join(nombres) if nombres else "ningún usuario encontrado"
                pretty_prompt = (
                    f"El usuario preguntó: '{user_message}'. "
                    f"El resultado crudo de la consulta es: {nombres_str}. "
                    "Redacta una respuesta clara y conversacional en español, explicando el resultado de forma natural. Si no hay resultados, indícalo de forma amable."
                )
                pretty_response = client.chat.completions.create(
                    model="gpt-4o",
                    messages=[{"role": "system", "content": "Eres un asistente que redacta respuestas claras y naturales para resultados de consultas de usuarios."}, {"role": "user", "content": pretty_prompt}],
                    max_tokens=192,
                    temperature=0.5
                ).choices[0].message.content.strip()
                consulta_memory[session_id].append({"user": user_message, "assistant": pretty_response})
                return pretty_response
            else:
                # Redactar respuesta bonita usando el LLM para cualquier otro resultado
                pretty_prompt = (
                    f"El usuario preguntó: '{user_message}'. "
                    f"El resultado crudo de la consulta es: {result}. "
                    "Redacta una respuesta clara y conversacional en español, explicando el resultado de forma natural. Si no hay resultados, indícalo de forma amable."
                )
                pretty_response = client.chat.completions.create(
                    model="gpt-4o",
                    messages=[{"role": "system", "content": "Eres un asistente que redacta respuestas claras y naturales para resultados de consultas de usuarios."}, {"role": "user", "content": pretty_prompt}],
                    max_tokens=192,
                    temperature=0.5
                ).choices[0].message.content.strip()
                consulta_memory[session_id].append({"user": user_message, "assistant": pretty_response})
                return pretty_response
        except Exception as e:
            consulta_memory[session_id].append({"user": user_message, "assistant": f"Error ejecutando SQL: {e}"})
            return f"Error ejecutando SQL: {e}"
        finally:
            cursor.close()
            conn.close()
    else:
        consulta_memory[session_id].append({"user": user_message, "assistant": content})
        return content

@app.post("/consulta")
async def consulta(request: Request):
    data = await request.json()
    consulta = data.get("message", "")
    response = await consulta_with_llm(consulta)
    return {"response": response}
