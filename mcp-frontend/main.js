const apiBase = 'http://localhost:8000'; // Cambia si tu backend MCP está en otro puerto

// --- GESTIÓN DE USUARIOS ---

// Cargar usuarios al iniciar
window.addEventListener('DOMContentLoaded', () => {
    cargarUsuarios();
    appendChatMessage('bot', 'Hola, estoy listo para cargar usuario. Dame nombre y apellido.');
});

async function cargarUsuarios(q = '') {
    const res = await fetch(`${apiBase}/usuarios?q=${encodeURIComponent(q)}`);
    const usuarios = await res.json();
    renderListaUsuarios(usuarios);
}

function renderListaUsuarios(usuarios) {
    const ul = document.getElementById('user-list');
    ul.innerHTML = '';
    usuarios.forEach(u => {
        const li = document.createElement('li');
        li.textContent = `${u.nombre} ${u.apellido}`;
        ul.appendChild(li);
    });
}

// --- Formulario alta usuario ---
document.getElementById('add-user-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    // Corrige automáticamente la primer letra en mayúscula
    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }
    const nombre = capitalize(document.getElementById('nombre').value.trim());
    const apellido = capitalize(document.getElementById('apellido').value.trim());
    if (!nombre || !apellido) return;

    let body = { nombre, apellido };
    let intentoIgnorar = false;
    let continuar = true;

    while (continuar) {
        const res = await fetch(`${apiBase}/usuarios`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const data = await res.json();
        if (data.success) {
            const alertaDiv = document.getElementById('alerta-duplicado');
            alertaDiv.innerHTML = '<strong>Usuario agregado correctamente</strong>';
            alertaDiv.style.display = 'block';
            setTimeout(() => {
                alertaDiv.style.display = 'none';
            }, 2000);
            cargarUsuarios();
            this.reset();
            continuar = false;
        } else if (res.status === 409 && (data.error || data.advertencia)) {
            const alertaDiv = document.getElementById('alerta-duplicado');
            let msg = `<strong>⚠️ POSIBLE DUPLICADO DETECTADO ⚠️</strong><br>${data.advertencia || data.error || ''}`;
            if (data.duplicados || data.similares) {
                msg += '<br>Usuarios similares encontrados:<ul>';
                (data.duplicados || data.similares).forEach(u => {
                    msg += `<li>ID: ${u.id} | ${u.nombre} ${u.apellido} <span style='color:#888'>(similitud: ${u.similitud ?? ''})</span></li>`;
                });
                msg += '</ul>';
            }
            msg += '<button id="btn-forzar-alta" class="btn btn-sm btn-danger mt-2">Forzar alta</button>';
            alertaDiv.innerHTML = msg;
            alertaDiv.style.display = 'block';
            document.getElementById('btn-forzar-alta').onclick = async () => {
                body.ignorar_duplicado = true;
                const res2 = await fetch(`${apiBase}/usuarios`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });
                const data2 = await res2.json();
                if (data2.success) {
                    alertaDiv.innerHTML = '<strong>Usuario agregado correctamente</strong>';
                    setTimeout(() => { alertaDiv.style.display = 'none'; }, 2000);
                    cargarUsuarios();
                    document.getElementById('add-user-form').reset();
                } else {
                    alertaDiv.innerHTML = `<strong>Error: ${data2.error || 'Error'}</strong>`;
                    setTimeout(() => { alertaDiv.style.display = 'none'; }, 2000);
                }
            };
            continuar = false;
        } else if (data.duplicados || data.similares || data.sugerencia) {
            // Mostrar advertencia visual en el formulario
            const alertaDiv = document.getElementById('alerta-duplicado');
            let msg = '<strong>⚠️ POSIBLE DUPLICADO DETECTADO ⚠️</strong><br>';
            if (data.duplicados || data.similares) {
                msg += 'Se encontraron usuarios muy similares:<ul>';
                (data.duplicados || data.similares).forEach(u => {
                    msg += `<li>${u.nombre} ${u.apellido} <span style="color:#888">(similitud: ${u.similitud ?? ''})</span></li>`;
                });
                msg += '</ul>';
            }
            if (data.advertencia) {
                msg += `<div>${data.advertencia}</div>`;
            }
            if (data.sugerencia) {
                msg += `<div><button id="btn-aplicar-sugerencia" class="btn btn-sm btn-info mt-2">Aplicar sugerencia: ${data.sugerencia}</button></div>`;
            }
            msg += '<div class="mt-2">¿Deseas <button id="btn-corregir" class="btn btn-sm btn-warning">corregir</button> '
                + '<button id="btn-ignorar" class="btn btn-sm btn-success">ignorar y agregar igual</button> '
                + '<button id="btn-cancelar" class="btn btn-sm btn-secondary">cancelar</button>?</div>';
            alertaDiv.innerHTML = msg;
            alertaDiv.style.display = 'block';
            // Sugerencia IA
            if (data.sugerencia) {
                document.getElementById('btn-aplicar-sugerencia').onclick = () => {
                    let partes = data.sugerencia.split(' ');
                    const nombreCorr = partes[0] || '';
                    const apellidoCorr = partes.slice(1).join(' ') || '';
                    document.getElementById('nombre').value = nombreCorr;
                    document.getElementById('apellido').value = apellidoCorr;
                    alertaDiv.style.display = 'none';
                };
            }
            // Esperar acción del usuario
            await new Promise(resolve => {
                document.getElementById('btn-corregir').onclick = () => { alertaDiv.style.display='none'; resolve('corregir'); };
                document.getElementById('btn-ignorar').onclick = () => { alertaDiv.style.display='none'; resolve('ignorar'); };
                document.getElementById('btn-cancelar').onclick = () => { alertaDiv.style.display='none'; resolve('cancelar'); };
            }).then(opcion => {
                if (opcion === 'ignorar') {
                    body.ignorar_duplicado = true;
                    intentoIgnorar = true;
                    continuar = true;
                } else if (opcion === 'cancelar') {
                    continuar = false;
                } else {
                    continuar = false;
                }
            });
        } else {
            const alertaDiv = document.getElementById('alerta-duplicado');
            alertaDiv.innerHTML = `<strong>Error: ${data.error || 'Error'}</strong>`;
            alertaDiv.style.display = 'block';
            setTimeout(() => {
                alertaDiv.style.display = 'none';
            }, 2000);
            continuar = false;
        }
    }
});

// --- Búsqueda en tiempo real ---
document.getElementById('search').addEventListener('input', function() {
    cargarUsuarios(this.value);
});

// --- CHATBOT ---

// --- Limpiar chat desde el botón del bot ---
document.addEventListener('click', function(e) {
    if (e.target && e.target.id === 'btn-limpiar-chat') {
        // Borra mensajes del chat
        chatMessages.innerHTML = '';
        // Enviar reset al backend y mostrar mensaje de bienvenida
        fetch(`${apiBase}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: '__reset__' })
        })
        .then(r => r.json())
        .then(data => {
            appendChatMessage('bot', data.response);
            cargarUsuarios();
        });
    }
});


const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const chatMessages = document.getElementById('chat-messages');

chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const message = chatInput.value.trim();
    if (!message) return;
    appendChatMessage('user', message);
    chatInput.value = '';

    const response = await fetch(`${apiBase}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
    });
    const data = await response.json();

    // Detectar opciones de respuesta según el flujo conversacional guiado
    let options = null;
    const resp = (typeof data.response === 'string') ? data.response.toLowerCase() : '';
    if (resp.includes('¿quisiste decir') && resp.includes('? responde')) {
        options = ['Sí', 'No'];
    } else if (resp.includes('¿confirmas que el usuario es') && resp.includes('responde')) {
        options = ['Confirmar', 'Cancelar'];
    } else if (resp.includes('¿forzar carga?') && resp.includes('responde')) {
        options = ['Sí', 'No'];
    } else if (resp.includes('limpiar chat')) {
        cargarUsuarios();
    }
    appendChatMessage('bot', data.response, options);

    // Si el bot responde alta exitosa o limpiar chat, actualizar lista
    if (resp.includes('ingresado a la bbdd') || resp.includes('agregado correctamente')) {
        cargarUsuarios();
    }
});




function appendChatMessage(sender, text, options = null) {
    const div = document.createElement('div');
    div.className = sender === 'user' ? 'user-message' : 'bot-message';
    div.innerHTML = (sender === 'user' ? 'Tú: ' : 'Bot: ') + text;
    // Detectar y activar botones HTML del backend
    setTimeout(() => {
        div.querySelectorAll('button.boton-chat').forEach(btn => {
            btn.onclick = () => {
                // Si el botón es Confirmar/Cancelar, envía el valor en minúsculas
                const val = btn.getAttribute('data-value');
                if (val.toLowerCase() === 'confirmar' || val.toLowerCase() === 'cancelar') {
                    chatInput.value = val.toLowerCase();
                } else {
                    chatInput.value = val;
                }
                chatForm.dispatchEvent(new Event('submit'));
            };
        });
    }, 0);
    if (sender === 'bot' && options && Array.isArray(options)) {
        const btnDiv = document.createElement('div');
        btnDiv.style.marginTop = '8px';
        options.forEach(opt => {
            const btn = document.createElement('button');
            btn.textContent = opt;
            btn.className = 'btn btn-sm btn-outline-primary mx-1';
            btn.onclick = () => {
                chatInput.value = opt;
                chatForm.dispatchEvent(new Event('submit'));
            };
            btnDiv.appendChild(btn);
        });
        div.appendChild(btnDiv);
    }
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}