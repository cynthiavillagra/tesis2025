const apiBase = 'http://localhost:8000'; // Cambia si tu backend MCP está en otro puerto

// --- GESTIÓN DE USUARIOS ---

// Cargar usuarios al iniciar
window.addEventListener('DOMContentLoaded', () => {
    cargarUsuarios();
    appendChatMessage('bot', 'Hola, estoy listo para cargar usuario. Dame nombre y apellido.');
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
}

function renderListaUsuarios(data) {
    const ul = document.getElementById('user-list');
    ul.innerHTML = '';
    let lista = Array.isArray(data) ? data : (data.usuarios || []);
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
        ul.appendChild(li);
    });
}

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
    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }
    const nombre = capitalize(document.getElementById('nombre').value.trim());
    const apellido = capitalize(document.getElementById('apellido').value.trim());
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
        })
        .catch(error => console.error('Error al limpiar chat:', error));
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
});

function appendConsultaChatMessage(sender, text, options = null) {
    const div = document.createElement('div');
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
            let fixed = text
                .replace(/\(/g, '[')
                .replace(/\)/g, ']')
                .replace(/'/g, '"');
            const arr = JSON.parse(fixed);
            html += `<div class="consulta-lista-tuplas">` + arr.map(u =>
                Array.isArray(u) && u.length >= 3
                    ? `<span class="inline-block mb-0.5"><b>${u[0]}</b> — ${u[1]} ${u[2]}</span>`
                    : JSON.stringify(u)
            ).join('<br>') + `</div>`;
        } catch (e) {
            html += `<div class="consulta-lista-tuplas">` + text.replace(/\n/g, '<br>') + `</div>`;
        }
    } else {
        // Display lists preserving new lines (original logic for nested arrays)
        if (typeof text === 'string' && text.match(/^\[\[/)) {
            try {
                const arr = JSON.parse(text.replace(/'/g, '"'));
                if (Array.isArray(arr)) {
                    html += '<ul class="mt-2 pl-4 list-disc">';
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
    }
});


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
            btn.onclick = () => {
                chatInput.value = opt;
                chatForm.dispatchEvent(new Event('submit'));
            };
            btnDiv.appendChild(btn);
        });
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
