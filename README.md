# Chatbot Conversacional – Ingreso y Consulta de Datos en MySQL

> **⚠️  Avisos importantes antes de ejecutar**

1. En **`backend/.env`** debes poner tu **clave de API de OpenAI**  
   `OPENAI_API_KEY=sk-…`
2. En **`backend/mcp_agent.py`** se configura la **conexión a la base MySQL**  
   (host, usuario, contraseña, nombre de la base).
3. Instala todas las librerías de Python con  
   ```bash
   pip install -r requirements.txt
   ```
4. Es necesario tener **XAMPP** corriendo con **Apache** y **MariaDB** activos.  
5. El servidor de Python utiliza **FastAPI**.  
   ```bash
   pip install fastapi uvicorn
   uvicorn main:app --reload
   ```
6. Se incluye un dump SQL de usuarios; impórtalo desde **phpMyAdmin** o crea tu propia base con la misma estructura.
7. El proyecto fue probado solo **en entorno local**.

---

## Estructura del repositorio

```
├── backend
│   ├── main.py            # Entrypoint FastAPI
│   ├── mcp_agent.py       # Lógica de chatbot + conexión MySQL
│   ├── .env               # Clave OpenAI (NO subir)
│   └── requirements.txt
├── frontend
│   ├── index.html         # Chat UI
│   └── scripts.js         # Fetch hacia la API
├── sql
│   └── usuarios_dump.sql  # Base de datos de ejemplo
└── README.md
```

---

## Puesta en marcha rápida

1. Clona el repo y entra al directorio:
   ```bash
   git clone https://github.com/tu_usuario/chatbot-sql.git
   cd chatbot-sql
   ```

2. Crea y activa un entorno virtual (opcional pero recomendado):
   ```bash
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   ```

3. Instala dependencias:
   ```bash
   pip install -r backend/requirements.txt
   ```

4. Configura variables:
   - Copia **`backend/.env.example`** a **`.env`** y agrega tu `OPENAI_API_KEY`.
   - Edita **`backend/mcp_agent.py`** con tus credenciales MySQL.

5. Inicia XAMPP y activa Apache + MariaDB.

6. Importa el dump:
   - Abre **phpMyAdmin** → **Importar** → selecciona `sql/usuarios_dump.sql`.

7. Levanta la API:
   ```bash
   cd backend
   uvicorn main:app --reload
   ```

8. Abre `frontend/index.html` en tu navegador y comienza a chatear.

---

## Endpoints principales (FastAPI)

| Método | Ruta   | Descripción                        |
|--------|--------|------------------------------------|
| POST   | /chat  | Envía mensaje al chatbot           |
| GET    | /users | Devuelve lista de usuarios         |
| POST   | /users | Crea nuevo usuario                 |

La documentación interactiva está disponible en `http://localhost:8000/docs`.

---

## Notas de seguridad

- La API key **no** debe subirse al repositorio.  
- Se usan tokens JWT para proteger los endpoints.  
- El backend y el frontend deben comunicarse bajo **HTTPS** en producción.

---

## Limitaciones actuales

- Probado únicamente en localhost (Windows + XAMPP).  
- Modelo GPT‑4o llamado mediante la API de OpenAI (costos por uso).  
- No incluye edición ni eliminación de registros; solo alta y consulta.

---

## Próximos pasos

- Implementar pruebas E2E.  
- Dockerizar la aplicación para despliegue sencillo.  
- Añadir integración con WhatsApp y autenticación OAuth.

---

© 2025 · Cynthia Marcela Villagra – Proyecto Integrador Tecnicatura en Ciencia de Datos e IA
