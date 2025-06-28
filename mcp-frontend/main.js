const apiBase = 'http://localhost:8000'; // Cambia si tu backend MCP está en otro puerto

// --- GESTIÓN DE USUARIOS ---

// Cargar usuarios al iniciar
window.addEventListener('DOMContentLoaded', () => {
    cargarUsuarios();
    appendChatMessage('bot', 'Hola, estoy listo para cargar usuario. Dame nombre y apellido.');
<<<<<<< HEAD
});

async function cargarUsuarios(q = '') {
    const res = await fetch(`${apiBase}/usuarios?q=${encodeURIComponent(q)}`);
    const data = await res.json();
    // Mostrar advertencia de similitud si corresponde
    const advertDivId = 'busqueda-sugerencia';
    let advertDiv = document.getElementById(advertDivId);
    if (!advertDiv) {
        advertDiv = document.createElement('div');
        advertDiv.id = advertDivId;
        advertDiv.style.display = 'none';
        advertDiv.style.background = '#fffbe7';
        advertDiv.style.border = '1.5px solid #ffc107';
        advertDiv.style.color = '#b47d00';
        advertDiv.style.padding = '7px 12px';
        advertDiv.style.margin = '7px 0 0 0';
        advertDiv.style.borderRadius = '6px';
        advertDiv.style.fontWeight = 'bold';
        advertDiv.style.fontSize = '1em';
        document.getElementById('search').insertAdjacentElement('afterend', advertDiv);
    }
    if (data.sugerencia) {
        advertDiv.innerHTML = `Quizás quisiste decir: <b style='cursor:pointer; text-decoration:underline;'>${data.sugerencia}</b>?`;
        advertDiv.style.display = 'block';
        // Permite hacer clic en la sugerencia para autocompletar
        const b = advertDiv.querySelector('b');
        if (b) {
            b.onclick = () => {
                document.getElementById('search').value = data.sugerencia;
                cargarUsuarios(data.sugerencia);
            };
        }
    } else {
        advertDiv.style.display = 'none';
    }
    renderListaUsuarios(data.usuarios || data);
=======
    appendConsultaChatMessage('bot', 'Hola, estoy listo para tus consultas sobre usuarios.');
});

async function cargarUsuarios(q = '') {
    try {
        const res = await fetch(`${apiBase}/usuarios?q=${encodeURIComponent(q)}`);
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        const advertDiv = document.getElementById('busqueda-sugerencia');

        if (!advertDiv) {
            // Re-create advertDiv if it was hidden by display:none and not present in DOM initially
            advertDiv = document.createElement('div');
            advertDiv.id = 'busqueda-sugerencia';
            // Apply Tailwind classes directly here since it's created dynamically
            advertDiv.classList.add('hidden', 'text-sm', 'px-4', 'py-3', 'rounded-md', 'mt-3', 'font-semibold', 'bg-yellow-100', 'border', 'border-yellow-400', 'text-yellow-700');
            document.getElementById('search').insertAdjacentElement('afterend', advertDiv);
        }

        if (data.sugerencia) {
            advertDiv.innerHTML = `Quizás quisiste decir: <b class="cursor-pointer underline text-blue-700 hover:text-blue-900">${data.sugerencia}</b>?`;
            advertDiv.classList.remove('hidden');
            const b = advertDiv.querySelector('b');
            if (b) {
                b.onclick = () => {
                    document.getElementById('search').value = data.sugerencia;
                    cargarUsuarios(data.sugerencia);
                };
            }
        } else {
            advertDiv.classList.add('hidden');
        }
        renderListaUsuarios(data.usuarios || data);
    } catch (error) {
        console.error('Error al cargar usuarios:', error);
        mostrarAlertaForm('Error al cargar usuarios. Intenta de nuevo más tarde.', 'error');
    }
>>>>>>> 80602d7 (correccion frontend)
}

function renderListaUsuarios(data) {
    const ul = document.getElementById('user-list');
    ul.innerHTML = '';
    let lista = Array.isArray(data) ? data : (data.usuarios || []);
<<<<<<< HEAD
    lista.forEach(u => {
        const li = document.createElement('li');
        li.textContent = `${u.nombre} ${u.apellido}`;
=======
    if (lista.length === 0) {
        const li = document.createElement('li');
        li.className = 'px-4 py-3 text-gray-500 text-center';
        li.textContent = 'No hay usuarios para mostrar.';
        ul.appendChild(li);
        return;
    }
    lista.forEach(u => {
        const li = document.createElement('li');
        li.className = 'px-4 py-3 hover:bg-gray-100 transition-colors flex justify-between items-center';
        li.innerHTML = `
            <span>${u.nombre} ${u.apellido}</span>
            <span class="text-xs text-gray-400">ID: ${u.id || 'N/A'}</span>
        `;
>>>>>>> 80602d7 (correccion frontend)
        ul.appendChild(li);
    });
}

<<<<<<< HEAD
// --- Formulario alta usuario ---
document.getElementById('add-user-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    // Corrige automáticamente la primer letra en mayúscula
=======
// --- Funciones para mostrar alertas de formulario ---
function mostrarAlertaForm(message, type = 'info') {
    const alertaDiv = document.getElementById('alerta-form');
    alertaDiv.innerHTML = message;
    // Clear all previous type classes and reset to hidden
    alertaDiv.classList.remove('hidden', 'bg-green-100', 'border-green-400', 'text-green-700', 'bg-red-100', 'border-red-400', 'text-red-700', 'bg-yellow-100', 'border-yellow-400', 'text-yellow-700', 'bg-blue-100', 'border-blue-400', 'text-blue-700');

    // Add new type classes
    if (type === 'success') {
        alertaDiv.classList.add('bg-green-100', 'border-green-400', 'text-green-700');
    } else if (type === 'error') {
        alertaDiv.classList.add('bg-red-100', 'border-red-400', 'text-red-700');
    } else if (type === 'warning') {
        alertaDiv.classList.add('bg-yellow-100', 'border-yellow-400', 'text-yellow-700');
    } else { /* default info */
        alertaDiv.classList.add('bg-blue-100', 'border-blue-400', 'text-blue-700');
    }
    alertaDiv.classList.remove('hidden');
}

// --- Formulario alta usuario ---
document.getElementById('add-user-form').addEventListener('submit', async function(e) {
    e.preventDefault();
>>>>>>> 80602d7 (correccion frontend)
    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }
    const nombre = capitalize(document.getElementById('nombre').value.trim());
    const apellido = capitalize(document.getElementById('apellido').value.trim());
<<<<<<< HEAD
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
=======
    if (!nombre || !apellido) {
        mostrarAlertaForm('Por favor, ingresa nombre y apellido.', 'warning');
        return;
    }

    let body = { nombre, apellido };
    let continuar = true;

    while (continuar) {
        try {
            const res = await fetch(`${apiBase}/usuarios`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const data = await res.json();

            if (res.ok) { // Status 2xx
                mostrarAlertaForm('<strong>✔ Usuario agregado correctamente</strong>', 'success');
                setTimeout(() => { document.getElementById('alerta-form').classList.add('hidden'); }, 2000);
                cargarUsuarios();
                this.reset();
                continuar = false;
            } else if (res.status === 409 && (data.error || data.advertencia)) { // Conflict - Posible duplicado
                const alertaDiv = document.getElementById('alerta-form'); // Use alerta-form for consistency
                let msg = `
                    <p class="font-bold text-lg mb-2">⚠️ POSIBLE DUPLICADO DETECTADO ⚠️</p>
                    <p class="mb-2">${data.advertencia || data.error || ''}</p>
                `;
                if (data.duplicados && data.duplicados.length > 0) {
                    msg += '<p class="font-medium">Usuarios similares encontrados:</p><ul class="list-disc list-inside text-sm mb-3">';
                    data.duplicados.forEach(u => {
                        msg += `<li>ID: ${u.id || 'N/A'} | ${u.nombre} ${u.apellido} <span class="text-gray-500">(similitud: ${u.similitud ? u.similitud.toFixed(2) : 'N/A'})</span></li>`;
                    });
                    msg += '</ul>';
                }
                if (data.sugerencia) {
                    msg += `<p class="mb-3">¿Quizás quisiste decir: <button type="button" id="btn-aplicar-sugerencia" class="text-blue-700 hover:text-blue-900 underline font-semibold"><u>${data.sugerencia}</u></button>?</p>`;
                }
                msg += `
                    <div class="flex flex-wrap gap-2 mt-4">
                        <button type="button" id="btn-corregir" class="btn bg-yellow-500 text-white hover:bg-yellow-600">Corregir</button>
                        <button type="button" id="btn-ignorar" class="btn bg-green-500 text-white hover:bg-green-600">Ignorar y agregar igual</button>
                        <button type="button" id="btn-cancelar" class="btn bg-gray-500 text-white hover:bg-gray-600">Cancelar</button>
                    </div>
                `;
                mostrarAlertaForm(msg, 'warning');

                // Attach listeners to new buttons
                const btnAplicarSugerencia = document.getElementById('btn-aplicar-sugerencia');
                if (btnAplicarSugerencia) {
                    btnAplicarSugerencia.onclick = () => {
                        let partes = data.sugerencia.split(' ');
                        document.getElementById('nombre').value = partes[0] || '';
                        document.getElementById('apellido').value = partes.slice(1).join(' ') || '';
                        alertaDiv.classList.add('hidden'); // Ocultar alerta después de aplicar
                    };
                }

                await new Promise(resolve => {
                    document.getElementById('btn-corregir').onclick = () => { alertaDiv.classList.add('hidden'); resolve('corregir'); };
                    document.getElementById('btn-ignorar').onclick = () => { alertaDiv.classList.add('hidden'); resolve('ignorar'); };
                    document.getElementById('btn-cancelar').onclick = () => { alertaDiv.classList.add('hidden'); resolve('cancelar'); };
                }).then(opcion => {
                    if (opcion === 'ignorar') {
                        body.ignorar_duplicado = true;
                        continuar = true;
                    } else {
                        continuar = false;
                    }
                });
            } else { // Other errors
                mostrarAlertaForm(`<strong>Error:</strong> ${data.error || 'Ocurrió un error desconocido.'}`, 'error');
                setTimeout(() => { document.getElementById('alerta-form').classList.add('hidden'); }, 2000);
                continuar = false;
            }
        } catch (error) {
            console.error('Error al enviar usuario:', error);
            mostrarAlertaForm('Error de conexión o del servidor. Intenta de nuevo.', 'error');
            setTimeout(() => { document.getElementById('alerta-form').classList.add('hidden'); }, 2000);
>>>>>>> 80602d7 (correccion frontend)
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
<<<<<<< HEAD
        });
=======
        })
        .catch(error => console.error('Error al limpiar chat:', error));
>>>>>>> 80602d7 (correccion frontend)
    }
});

// --- CHAT DE CONSULTAS ---
const consultaChatForm = document.getElementById('consulta-chat-form');
const consultaChatInput = document.getElementById('consulta-chat-input');
const consultaChatMessages = document.getElementById('consulta-chat-messages');

consultaChatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const message = consultaChatInput.value.trim();
    if (!message) return;
    appendConsultaChatMessage('user', message);
    consultaChatInput.value = '';

<<<<<<< HEAD
    // Ahora usa el endpoint /consulta
    const response = await fetch(`${apiBase}/consulta`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
    });
    const data = await response.json();

    appendConsultaChatMessage('bot', data.response);
=======
    // Simulate thinking state for the bot
    const thinkingMessageDiv = document.createElement('div');
    thinkingMessageDiv.className = 'flex justify-start';
    thinkingMessageDiv.innerHTML = '<div class="bg-gray-200 text-gray-800 p-3 rounded-lg max-w-[80%]"><span class="font-semibold">Bot:</span> Pensando...</div>';
    consultaChatMessages.appendChild(thinkingMessageDiv);
    consultaChatMessages.scrollTop = consultaChatMessages.scrollHeight;

    try {
        const response = await fetch(`${apiBase}/consulta`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message })
        });
        const data = await response.json();

        // Remove thinking message
        if (consultaChatMessages.contains(thinkingMessageDiv)) {
            consultaChatMessages.removeChild(thinkingMessageDiv);
        }

        appendConsultaChatMessage('bot', data.response);
    } catch (error) {
         if (consultaChatMessages.contains(thinkingMessageDiv)) {
            consultaChatMessages.removeChild(thinkingMessageDiv);
        }
        console.error('Error al comunicarse con el backend (Consulta):', error);
        appendConsultaChatMessage('bot', 'Hubo un problema al conectar con el servidor. Intenta de nuevo.');
    }
>>>>>>> 80602d7 (correccion frontend)
});

function appendConsultaChatMessage(sender, text, options = null) {
    const div = document.createElement('div');
<<<<<<< HEAD
    div.className = sender === 'user' ? 'consulta-user-message' : 'consulta-bot-message';
    let html = '';

    // Si la respuesta incluye aviso de similitud
    if (typeof text === 'object' && text.similar) {
        html += `<div style='color:#b47d00; font-weight:bold;'>Coincidencia similar encontrada: ${text.similar}</div>`;
        text = text.result;
    }

    // Mostrar listas de tuplas [(id, 'Nombre', 'Apellido'), ...] de forma bonita
    if (typeof text === 'string' && text.trim().startsWith('[') && text.includes('(')) {
        try {
            // Normaliza comillas y paréntesis a formato JSON
=======
    div.className = sender === 'user' ? 'flex justify-end' : 'flex justify-start';
    const messageContentDiv = document.createElement('div');
    messageContentDiv.className = sender === 'user' ? 'bg-indigo-500 text-white p-3 rounded-lg max-w-[80%]' : 'bg-gray-200 text-gray-800 p-3 rounded-lg max-w-[80%]';
    
    let html = '';

    // If the response includes similarity warning
    if (typeof text === 'object' && text.similar) {
        html += `<div class='text-yellow-700 font-bold'>Coincidencia similar encontrada: ${text.similar}</div>`;
        text = text.result; // Use the actual result part
    }

    // Display lists of tuples [(id, 'Nombre', 'Apellido'), ...] nicely (original logic)
    if (typeof text === 'string' && text.trim().startsWith('[') && text.includes('(')) {
        try {
            // Normalize quotes and parentheses to JSON format
>>>>>>> 80602d7 (correccion frontend)
            let fixed = text
                .replace(/\(/g, '[')
                .replace(/\)/g, ']')
                .replace(/'/g, '"');
            const arr = JSON.parse(fixed);
            html += `<div class="consulta-lista-tuplas">` + arr.map(u =>
                Array.isArray(u) && u.length >= 3
<<<<<<< HEAD
                    ? `<span style="display:inline-block;margin-bottom:2px;"><b>${u[0]}</b> — ${u[1]} ${u[2]}</span>`
=======
                    ? `<span class="inline-block mb-0.5"><b>${u[0]}</b> — ${u[1]} ${u[2]}</span>`
>>>>>>> 80602d7 (correccion frontend)
                    : JSON.stringify(u)
            ).join('<br>') + `</div>`;
        } catch (e) {
            html += `<div class="consulta-lista-tuplas">` + text.replace(/\n/g, '<br>') + `</div>`;
        }
    } else {
<<<<<<< HEAD
        // Mostrar listas preservando saltos de línea
=======
        // Display lists preserving new lines (original logic for nested arrays)
>>>>>>> 80602d7 (correccion frontend)
        if (typeof text === 'string' && text.match(/^\[\[/)) {
            try {
                const arr = JSON.parse(text.replace(/'/g, '"'));
                if (Array.isArray(arr)) {
<<<<<<< HEAD
                    html += '<ul style="margin: 8px 0 0 0; padding-left: 18px">';
=======
                    html += '<ul class="mt-2 pl-4 list-disc">';
>>>>>>> 80602d7 (correccion frontend)
                    arr.forEach(item => {
                        if (Array.isArray(item)) {
                            html += `<li>${item.map(e => e.toString()).join(' ')}</li>`;
                        } else {
                            html += `<li>${item.toString().replace(/\n/g, '<br>')}</li>`;
                        }
                    });
                    html += '</ul>';
                } else {
                    html += text.replace(/\n/g, '<br>');
                }
            } catch {
                html += text.replace(/\n/g, '<br>');
            }
        } else {
            html += text && typeof text === 'string' ? text.replace(/\n/g, '<br>') : text;
        }
    }
<<<<<<< HEAD

    // Si hay botones en la respuesta del bot, aplicar clase .consulta-btn
    if (options && Array.isArray(options)) {
        html += '<div style="margin-top:6px;">';
        options.forEach(opt => {
            html += `<button class="consulta-btn">${opt}</button> `;
        });
        html += '</div>';
    }

    div.innerHTML = (sender === 'user' ? '<b>Tú:</b> ' : '<b>Bot:</b> ') + html;
=======
            
    messageContentDiv.innerHTML = (sender === 'user' ? '<b>Tú:</b> ' : '<b>Bot:</b> ') + html;

    // Original logic for dynamic option buttons in chat
    if (options && Array.isArray(options)) {
        const btnDiv = document.createElement('div');
        btnDiv.className = 'mt-2 flex flex-wrap gap-1'; // Adjusted for Tailwind and smaller gap
        options.forEach(opt => {
            const btn = document.createElement('button');
            btn.textContent = opt;
            // Apply Tailwind classes for smaller buttons
            btn.className = 'bg-indigo-100 text-indigo-700 border border-indigo-400 text-xs py-1 px-2 rounded-md hover:bg-indigo-200 transition-colors';
            btn.onclick = () => {
                consultaChatInput.value = opt;
                consultaChatForm.dispatchEvent(new Event('submit'));
            };
            btnDiv.appendChild(btn);
        });
        messageContentDiv.appendChild(btnDiv);
    }

    div.appendChild(messageContentDiv);
>>>>>>> 80602d7 (correccion frontend)
    consultaChatMessages.appendChild(div);
    consultaChatMessages.scrollTop = consultaChatMessages.scrollHeight;
}

const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const chatMessages = document.getElementById('chat-messages');

chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const message = chatInput.value.trim();
    if (!message) return;
<<<<<<< HEAD
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
=======
    
    // Append user message immediately
    const userMessageDiv = document.createElement('div');
    userMessageDiv.className = 'flex justify-end';
    userMessageDiv.innerHTML = `<div class="bg-blue-500 text-white p-3 rounded-lg max-w-[80%]">${message}</div>`;
    chatMessages.appendChild(userMessageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    chatInput.value = '';

    // Simulate thinking state for the bot
    const thinkingMessageDiv = document.createElement('div');
    thinkingMessageDiv.className = 'flex justify-start';
    thinkingMessageDiv.innerHTML = '<div class="bg-gray-200 text-gray-800 p-3 rounded-lg max-w-[80%]"><span class="font-semibold">Bot:</span> Pensando...</div>';
    chatMessages.appendChild(thinkingMessageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    try {
        const response = await fetch(`${apiBase}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message })
        });
        const data = await response.json();

        // Remove thinking message
        if (chatMessages.contains(thinkingMessageDiv)) {
            chatMessages.removeChild(thinkingMessageDiv);
        }

        // Detectar opciones de respuesta según el flujo conversacional guiado (original logic)
        let options = null;
        const resp = (typeof data.response === 'string') ? data.response.toLowerCase() : '';
        if (resp.includes('¿quisiste decir') && resp.includes('? responde')) {
            options = ['Sí', 'No'];
        } else if (resp.includes('¿confirmas que el usuario es') && resp.includes('responde')) {
            options = ['Confirmar', 'Cancelar'];
        } else if (resp.includes('¿forzar carga?') && resp.includes('responde')) {
            options = ['Sí', 'No'];
        } else if (resp.includes('limpiar chat')) {
            cargarUsuarios(); // Reload users if chat implies a change in data
        }
        appendChatMessage('bot', data.response, options);

        // Si el bot responde alta exitosa o limpiar chat, actualizar lista
        if (resp.includes('ingresado a la bbdd') || resp.includes('agregado correctamente')) {
            cargarUsuarios();
        }

    } catch (error) {
        if (chatMessages.contains(thinkingMessageDiv)) {
            chatMessages.removeChild(thinkingMessageDiv);
        }
        console.error('Error al comunicarse con el backend (Chat de Ingreso):', error);
        appendChatMessage('bot', 'Hubo un problema al conectar con el servidor. Intenta de nuevo.');
>>>>>>> 80602d7 (correccion frontend)
    }
});


<<<<<<< HEAD


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
=======
function appendChatMessage(sender, text, options = null) {
    const div = document.createElement('div');
    div.className = sender === 'user' ? 'flex justify-end' : 'flex justify-start';
    const messageContentDiv = document.createElement('div');
    messageContentDiv.className = sender === 'user' ? 'bg-blue-500 text-white p-3 rounded-lg max-w-[80%]' : 'bg-gray-200 text-gray-800 p-3 rounded-lg max-w-[80%]';
    
    messageContentDiv.innerHTML = (sender === 'user' ? '' : '<span class="font-semibold">Bot:</span> ') + text;
    
    // Original logic for dynamic option buttons in chat
    if (options && Array.isArray(options)) {
        const btnDiv = document.createElement('div');
        btnDiv.className = 'mt-2 flex flex-wrap gap-1'; // Adjusted gap for smaller buttons
        options.forEach(opt => {
            const btn = document.createElement('button');
            btn.textContent = opt;
            // Apply Tailwind classes for smaller buttons
            btn.className = 'bg-blue-100 text-blue-700 border border-blue-400 text-xs py-1 px-2 rounded-md hover:bg-blue-200 transition-colors';
>>>>>>> 80602d7 (correccion frontend)
            btn.onclick = () => {
                chatInput.value = opt;
                chatForm.dispatchEvent(new Event('submit'));
            };
            btnDiv.appendChild(btn);
        });
<<<<<<< HEAD
        div.appendChild(btnDiv);
    }
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}
=======
        messageContentDiv.appendChild(btnDiv);
    }
    
    div.appendChild(messageContentDiv);
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Activate backend-generated buttons after they are in the DOM (if any)
    setTimeout(() => {
        messageContentDiv.querySelectorAll('button.boton-chat').forEach(btn => {
            // Apply Tailwind classes to backend-generated buttons as well, with smaller styling
            btn.classList.add('bg-blue-600', 'text-white', 'font-bold', 'py-1', 'px-3', 'rounded-lg', 'hover:bg-blue-700', 'transition-colors', 'shadow-md', 'mx-0.5', 'text-xs');
            btn.onclick = () => {
                const val = btn.getAttribute('data-value');
                if (val && (val.toLowerCase() === 'confirmar' || val.toLowerCase() === 'cancelar')) {
                    chatInput.value = val.toLowerCase();
                } else if (val) {
                    chatInput.value = val;
                }
                chatForm.dispatchEvent(new Event('submit'));
            };
        });
        // Also apply general button styling for .consulta-btn if they appear (redundant if using options array, but good for safety)
        messageContentDiv.querySelectorAll('button.consulta-btn').forEach(btn => {
            btn.classList.add('bg-blue-600', 'text-white', 'font-bold', 'py-1', 'px-3', 'rounded-lg', 'hover:bg-blue-700', 'transition-colors', 'shadow-md', 'mx-0.5', 'text-xs');
        });
    }, 0); // Small timeout to ensure DOM update
}
>>>>>>> 80602d7 (correccion frontend)
