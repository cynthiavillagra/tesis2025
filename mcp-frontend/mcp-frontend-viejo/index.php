<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Gestión de Usuarios - MCP</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="container">
        <h1>Gestión de Usuarios</h1>
        <section class="form-section">
            <form id="add-user-form" class="d-flex mb-3" autocomplete="off">
                <input type="text" id="nombre" class="form-control me-2" placeholder="Nombre" required>
                <input type="text" id="apellido" class="form-control me-2" placeholder="Apellido" required>
                <button type="submit" class="btn btn-primary">Agregar</button>
            </form>
            <div id="alerta-duplicado" style="display:none" class="alert alert-warning"></div>
        </section>
        <section class="search-section">
            <input type="text" id="search" placeholder="Buscar por nombre o apellido">
        </section>
        <section class="list-section">
            <h2>Listado de Usuarios</h2>
            <ul id="user-list"></ul>
        </section>
        <section class="chat-section">
            <h2>Chatbot</h2>
            <div id="chat-messages"></div>
            <form id="chat-form">
                <input type="text" id="chat-input" placeholder="Escribe tu mensaje..." autocomplete="off" required>
                <button type="submit">Enviar</button>
            </form>
        </section>
    </div>
    <script src="main.js"></script>
</body>
</html>