# Sistema de Gestión y Consulta de Usuarios con LLM

## Instrucciones de Instalación y Uso

### 1. Clonar el repositorio
```bash
git clone https://github.com/cynthiavillagra/tesis2025.git
cd tesis2025/mcp-backend
```

### 2. Crear y activar un entorno virtual (recomendado)
```bash
python -m venv venv
# En Windows:
venv\Scripts\activate
# En Linux/Mac:
source venv/bin/activate
```

### 3. Instalar dependencias
```bash
pip install -r requirements.txt
```

### 4. Configurar la clave de API de OpenAI
Crea un archivo `.env` en la carpeta `mcp-backend` con el siguiente contenido (reemplaza TU_API_KEY por tu clave real):
```
OPENAI_API_KEY=TU_API_KEY
```

### 5. Iniciar el backend
```bash
uvicorn main:app --reload
```

### 6. Abrir el frontend
Abre el archivo `mcp-frontend/index.html` en tu navegador o sirve la carpeta con XAMPP si usas PHP.

---

## Datos del Proyecto
- **Nombre:** Cynthia Marcela Villagra
- **Profesor:** Erick Ravelo
- **Materia:** Proyecto Integrador (2025)
- **Instituto:** IFTS N° 24

---

## Descripción del Proyecto

Este sistema permite:
- Ingresar usuarios y consultar la base de datos mediante chat y consultas inteligentes.
- Utiliza un modelo LLM (OpenAI) para interpretar consultas en lenguaje natural y generar SQL de manera segura.
- Detecta posibles duplicados o nombres similares tanto al ingresar usuarios como al consultar o buscar.
- El frontend es moderno, responsivo y muestra advertencias de similitud en búsquedas y chats.

**Ideal para:** Instituciones educativas, oficinas o cualquier entorno donde se requiera gestionar usuarios y aprovechar IA para consultas avanzadas, todo con una interfaz amigable y profesional.
