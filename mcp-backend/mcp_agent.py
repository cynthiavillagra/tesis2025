import openai
import os
from dotenv import load_dotenv
from tools.sql_tool import execute_sql_query, search_duplicates
from tools.validate import validate_user_data

load_dotenv()
openai.api_key = os.getenv('OPENAI_API_KEY')

from fastapi import Request

chat_memory = {}

def reset_chat_memory(session_id):
    if session_id in chat_memory:
        del chat_memory[session_id]

def extract_nombre_apellido_ia(text):
    prompt = (
        "Extrae SOLO el nombre completo (todos los nombres) y el apellido completo (todos los apellidos) "
        "de la siguiente frase, separados por un espacio. Devuelve SOLO el nombre completo y el apellido completo, "
        "sin palabras adicionales, ni comillas. Si no puedes, responde 'NO EXTRAIDO':\n" + text
    )
    client = openai.Client()
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": "Eres un asistente experto en extracción de datos de frases en español."},
            {"role": "user", "content": prompt}
        ],
        max_tokens=10,
        temperature=0.0
    )
    resultado = response.choices[0].message.content.strip()
    if resultado.lower() == "no extraido" or resultado.count(" ") != 1:
        return None, None
    nombre, apellido = resultado.split(" ", 1)
    return nombre.capitalize(), apellido.capitalize()

def extract_nombre_apellido_flexible(text):
    palabras = text.strip().split()
    if len(palabras) >= 2:
        return palabras[-2].capitalize(), palabras[-1].capitalize()
    return None, None

async def chat_with_agent(user_message, session_id=None):
    global chat_memory
    if not session_id:
        session_id = 'default'

    state = chat_memory.get(session_id, {})
    msg = user_message.strip().lower()

    if msg == '__reset__':
        reset_chat_memory(session_id)
        return "Hola, estoy listo para cargar usuario. Dame nombre y apellido."

    if state.get('pending_typo_suggestion'):
        if msg == 'sí' or msg == 'si' or msg == 'confirmar':
            nombre, apellido = state['pending_typo_suggestion']
            # INSERTAR USUARIO DIRECTAMENTE (con chequeo de duplicados)
            import mysql.connector
            from difflib import SequenceMatcher
            conn = mysql.connector.connect(
                host="localhost",
                user="root",
                password="",
                database="chatbot_tesis"
            )
            cursor = conn.cursor(dictionary=True)
            cursor.execute(
                "SELECT id, nombre, apellido FROM usuarios WHERE SOUNDEX(nombre) = SOUNDEX(%s) OR nombre LIKE %s OR apellido LIKE %s",
                (nombre, f"%{nombre}%", f"%{apellido}%")
            )
            usuarios = cursor.fetchall()
            nombre_apellido_nuevo = f"{nombre.lower()} {apellido.lower()}"
            similares = []
            for u in usuarios:
                nombre_apellido_existente = f"{u['nombre'].lower()} {u['apellido'].lower()}"
                similitud = SequenceMatcher(None, nombre_apellido_nuevo, nombre_apellido_existente).ratio()
                if similitud >= 0.8:
                    similares.append({
                        "id": u["id"],
                        "nombre": u["nombre"].capitalize(),
                        "apellido": u["apellido"].capitalize(),
                        "similitud": round(similitud, 2)
                    })
            cursor.close()
            conn.close()
            if similares:
                state['pending_force'] = (nombre, apellido)
                state['similares'] = similares
                state.pop('pending_typo_suggestion')
                chat_memory[session_id] = state
                lista = '\n'.join([f"ID: {s['id']} | {s['nombre']} {s['apellido']} (similitud: {s['similitud']})" for s in similares])
                return f"Detecté posibles duplicados:\n{lista}\n¿Forzar carga? Responde 'sí' para forzar o 'no' para cancelar."
            execute_sql_query(f"INSERT INTO usuarios (nombre, apellido) VALUES ('{nombre}', '{apellido}')")
            reset_chat_memory(session_id)
            return f"Usuario {nombre} {apellido} ingresado a la BBDD.\n<button id='btn-limpiar-chat'>Limpiar chat</button>"
        elif msg == 'no' or msg == 'cancelar':
            original = state.get('last_user_input', '').strip()
            nombre_orig, apellido_orig = extract_nombre_apellido_flexible(original)
            if nombre_orig and apellido_orig:
                state['pending_confirm'] = (nombre_orig, apellido_orig)
                state.pop('pending_typo_suggestion')
                chat_memory[session_id] = state
                return f"¿Querés ingresar a '{nombre_orig} {apellido_orig}' como nombre y apellido? <button class='boton-chat' data-value='confirmar'>Confirmar</button> <button class='boton-chat' data-value='cancelar'>Cancelar</button>"
            state.pop('pending_typo_suggestion')
            chat_memory[session_id] = state
            return "No se pudo extraer nombre y apellido. Por favor, ingresá solo nombre y apellido. Ejemplo: Juan Perez."

    if state.get('pending_confirm'):
        if msg == 'confirmar':
            nombre, apellido = state['pending_confirm']
            import mysql.connector
            from difflib import SequenceMatcher
            conn = mysql.connector.connect(
                host="localhost",
                user="root",
                password="",
                database="chatbot_tesis"
            )
            cursor = conn.cursor(dictionary=True)
            cursor.execute(
                "SELECT id, nombre, apellido FROM usuarios WHERE SOUNDEX(nombre) = SOUNDEX(%s) OR nombre LIKE %s OR apellido LIKE %s",
                (nombre, f"%{nombre}%", f"%{apellido}%")
            )
            usuarios = cursor.fetchall()
            nombre_apellido_nuevo = f"{nombre.lower()} {apellido.lower()}"
            similares = []
            for u in usuarios:
                nombre_apellido_existente = f"{u['nombre'].lower()} {u['apellido'].lower()}"
                similitud = SequenceMatcher(None, nombre_apellido_nuevo, nombre_apellido_existente).ratio()
                if similitud >= 0.8:
                    similares.append({
                        "id": u["id"],
                        "nombre": u["nombre"].capitalize(),
                        "apellido": u["apellido"].capitalize(),
                        "similitud": round(similitud, 2)
                    })
            cursor.close()
            conn.close()
            if similares:
                state['pending_force'] = (nombre, apellido)
                state['similares'] = similares
                state.pop('pending_confirm')
                chat_memory[session_id] = state
                lista = '\n'.join([f"ID: {s['id']} | {s['nombre']} {s['apellido']} (similitud: {s['similitud']})" for s in similares])
                return f"Detecté posibles duplicados:\n{lista}\n¿Forzar carga? Responde 'sí' para forzar o 'no' para cancelar."
            execute_sql_query(f"INSERT INTO usuarios (nombre, apellido) VALUES ('{nombre}', '{apellido}')")
            reset_chat_memory(session_id)
            return f"Usuario {nombre} {apellido} ingresado a la BBDD.\n<button id='btn-limpiar-chat'>Limpiar chat</button>"
        elif msg == 'cancelar':
            reset_chat_memory(session_id)
            return "Operación cancelada. Si deseas cargar otro usuario, escribe nombre y apellido."

    if state.get('pending_force'):
        if msg == 'sí' or msg == 'si':
            nombre, apellido = state['pending_force']
            execute_sql_query(f"INSERT INTO usuarios (nombre, apellido) VALUES ('{nombre}', '{apellido}')")
            reset_chat_memory(session_id)
            return f"Usuario {nombre} {apellido} ingresado a la BBDD.\n<button id='btn-limpiar-chat'>Limpiar chat</button>"
        elif msg == 'no':
            reset_chat_memory(session_id)
            return "Operación cancelada. Si deseas cargar otro usuario, escribe nombre y apellido."

    state['last_user_input'] = user_message
    resultado = validate_user_data(user_message)
    if resultado is None or (isinstance(resultado, tuple) and resultado[0] is None):
        nombre_lit, apellido_lit = extract_nombre_apellido_flexible(user_message)
        if nombre_lit and apellido_lit:
            state['pending_confirm'] = (nombre_lit, apellido_lit)
            chat_memory[session_id] = state
            return f"¿Querés ingresar a '{nombre_lit} {apellido_lit}' como nombre y apellido? <button class='boton-chat' data-value='confirmar'>Confirmar</button> <button class='boton-chat' data-value='cancelar'>Cancelar</button>"
        chat_memory[session_id] = state
        return "No pude extraer nombre y apellido. Por favor, ingresa ambos. Ejemplo: Juan Perez."
    elif isinstance(resultado, tuple) and resultado[0] == 'SUGERENCIA':
        _, nombre_sug, apellido_sug = resultado
        nombre_lit, apellido_lit = extract_nombre_apellido_flexible(user_message)
        state['pending_typo_suggestion'] = (nombre_sug, apellido_sug)
        chat_memory[session_id] = state
        return (
            f"Detecté un posible error de tipeo. ¿Quisiste decir <b>{nombre_sug} {apellido_sug}</b>? "
            f"<button class='boton-chat' data-value='{nombre_sug} {apellido_sug}'>Aplicar sugerencia</button>"
            f"<br>O bien, ¿Querés ingresar a '{nombre_lit} {apellido_lit}' como nombre y apellido? "
            f"<button class='boton-chat' data-value='confirmar'>Confirmar</button> "
            f"<button class='boton-chat' data-value='cancelar'>Cancelar</button>"
        )
    else:
        nombre, apellido = resultado
        if len(nombre) < 2 or len(apellido) < 2:
            return "El nombre y el apellido deben tener al menos 2 letras cada uno."
        if not nombre.replace('á','a').replace('é','e').replace('í','i').replace('ó','o').replace('ú','u').replace('ñ','n').isalpha() or not apellido.replace('á','a').replace('é','e').replace('í','i').replace('ó','o').replace('ú','u').replace('ñ','n').isalpha():
            return "El nombre y el apellido solo pueden contener letras (sin números ni símbolos)."
        state['pending_confirm'] = (nombre, apellido)
        chat_memory[session_id] = state
        return f"¿Confirmas que el usuario es {nombre} {apellido}? <button class='boton-chat' data-value='confirmar'>Confirmar</button> <button class='boton-chat' data-value='cancelar'>Cancelar</button>"

        return "El nombre y el apellido deben tener al menos 2 letras cada uno."
    if not nombre.replace('á','a').replace('é','e').replace('í','i').replace('ó','o').replace('ú','u').replace('ñ','n').isalpha() or not apellido.replace('á','a').replace('é','e').replace('í','i').replace('ó','o').replace('ú','u').replace('ñ','n').isalpha():
        return "El nombre y el apellido solo pueden contener letras (sin números ni símbolos)."
    state['pending_confirm'] = (nombre, apellido)
    chat_memory[session_id] = state
    return f"¿Confirmas que el usuario es {nombre} {apellido}? <button class='boton-chat' data-value='confirmar'>Confirmar</button> <button class='boton-chat' data-value='cancelar'>Cancelar</button>"
