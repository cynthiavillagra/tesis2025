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
    else:
        cursor.execute("SELECT id, nombre, apellido FROM usuarios ORDER BY id DESC LIMIT 100")
    usuarios = cursor.fetchall()
    cursor.close()
    conn.close()
    return usuarios

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
