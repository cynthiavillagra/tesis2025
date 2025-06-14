import mysql.connector

def execute_sql_query(query):
    conn = mysql.connector.connect(
        host="localhost",
        user="root",
        password="",
        database="chatbot_tesis"
    )
    cursor = conn.cursor()
    cursor.execute(query)
    conn.commit()
    cursor.close()
    conn.close()

def search_duplicates(nombre, apellido):
    conn = mysql.connector.connect(
        host="localhost",
        user="root",
        password="",
        database="chatbot_tesis"
    )
    cursor = conn.cursor(buffered=True)
    query = ("SELECT id FROM usuarios WHERE SOUNDEX(nombre) = SOUNDEX(%s) OR nombre LIKE %s OR apellido LIKE %s")
    cursor.execute(query, (nombre, f"%{nombre}%", f"%{apellido}%"))
    result = cursor.fetchone()
    cursor.close()
    conn.close()
    return bool(result)
