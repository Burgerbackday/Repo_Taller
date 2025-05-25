// === GESTIÓN COMPLETA DE OPERADORES - CON DEBUG ===

let operadoresData = [];
let tareasDisponibles = [];

/**
 * Inicializar módulo de operadores
 */
function inicializarOperadores() {
    console.log("🚀 Inicializando módulo de operadores...");
    cargarOperadores();
    cargarTareasDisponibles();
}

/**
 * Cargar lista de operadores desde el backend
 */
async function cargarOperadores() {
    console.log("📡 Cargando operadores...");
    
    try {
        const response = await fetch("api/tareas/operadores.php", {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        
        console.log("📡 Respuesta del servidor:", response.status, response.statusText);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            const text = await response.text();
            console.error("❌ Respuesta no es JSON:", text);
            throw new Error("Respuesta del servidor no es JSON válido");
        }

        const data = await response.json();
        console.log("📦 Datos recibidos:", data);
        
        if (data.success) {
            operadoresData = data.data || [];
            renderizarOperadores();
            actualizarEstadisticas();
            console.log(`✅ ${data.total || operadoresData.length} operadores cargados`);
        } else {
            throw new Error(data.error || "Error desconocido del servidor");
        }

    } catch (error) {
        console.error("❌ Error cargando operadores:", error);
        mostrarError("Error cargando operadores: " + error.message);
        
        // Mostrar mensaje en la interfaz
        const contenedorDisponibles = document.getElementById("contenedor-disponibles");
        const contenedorGestion = document.getElementById("contenedor-operadores");
        
        const mensajeError = `
            <div class="text-center text-red-500 py-8">
                <p>❌ Error cargando operadores</p>
                <p class="text-sm">${error.message}</p>
                <button onclick="cargarOperadores()" class="mt-2 bg-red-500 text-white px-3 py-1 rounded text-xs">
                    🔄 Reintentar
                </button>
            </div>
        `;
        
        if (contenedorDisponibles) contenedorDisponibles.innerHTML = mensajeError;
        if (contenedorGestion) contenedorGestion.innerHTML = mensajeError;
    }
}

/**
 * Cargar tareas disponibles para asignación
 */
async function cargarTareasDisponibles() {
    console.log("📡 Cargando tareas disponibles...");
    
    try {
        const response = await fetch("api/tareas/get_tareas.php");
        const data = await response.json();
        
        console.log("📦 Tareas recibidas:", data);
        
        if (Array.isArray(data)) {
            tareasDisponibles = data;
            console.log(`✅ ${data.length} tareas disponibles cargadas`);
        } else {
            console.warn("⚠️ Respuesta de tareas no es array:", data);
            tareasDisponibles = [];
        }

    } catch (error) {
        console.error("❌ Error cargando tareas:", error);
        tareasDisponibles = [];
    }
}

/**
 * Renderizar operadores en la interfaz
 */
function renderizarOperadores() {
    console.log("🎨 Renderizando operadores...", operadoresData);
    
    const contenedorDisponibles = document.getElementById("contenedor-disponibles");
    const contenedorGestion = document.getElementById("contenedor-operadores");

    if (contenedorDisponibles) {
        renderizarOperadoresDisponibles(contenedorDisponibles);
    } else {
        console.warn("⚠️ Contenedor 'contenedor-disponibles' no encontrado");
    }

    if (contenedorGestion) {
        renderizarGestionOperadores(contenedorGestion);
    } else {
        console.warn("⚠️ Contenedor 'contenedor-operadores' no encontrado");
    }
}

/**
 * Renderizar vista de operadores disponibles
 */
function renderizarOperadoresDisponibles(contenedor) {
    console.log("🎨 Renderizando vista de disponibles...");
    contenedor.innerHTML = "";

    if (!Array.isArray(operadoresData) || operadoresData.length === 0) {
        contenedor.innerHTML = `
            <div class="text-center text-gray-500 py-8">
                <p>👥 No hay operadores registrados</p>
                <button onclick="mostrarFormularioOperador('crear')" 
                        class="mt-4 bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700">
                    ➕ Agregar Primer Operador
                </button>
            </div>
        `;
        return;
    }

    const operadoresDisponibles = operadoresData.filter(op => op.estado === 'disponible');
    const operadoresOcupados = operadoresData.filter(op => op.estado === 'ocupado');

    console.log(`📊 Disponibles: ${operadoresDisponibles.length}, Ocupados: ${operadoresOcupados.length}`);

    // Sección disponibles
    if (operadoresDisponibles.length > 0) {
        const divDisponibles = document.createElement("div");
        divDisponibles.innerHTML = `
            <h4 class="text-sm font-semibold text-green-600 mb-2">👨‍🔧 Disponibles (${operadoresDisponibles.length})</h4>
        `;
        
        operadoresDisponibles.forEach(op => {
            const div = document.createElement("div");
            div.className = "p-3 bg-green-50 border border-green-200 rounded mb-2";
            div.innerHTML = `
                <div class="font-semibold text-green-700">${op.especialidad}</div>
                <div class="text-sm">${op.nombre}</div>
                <div class="text-xs text-green-600">✅ Disponible</div>
            `;
            divDisponibles.appendChild(div);
        });
        
        contenedor.appendChild(divDisponibles);
    }

    // Sección ocupados
    if (operadoresOcupados.length > 0) {
        const divOcupados = document.createElement("div");
        divOcupados.className = "mt-6";
        divOcupados.innerHTML = `
            <h4 class="text-sm font-semibold text-blue-600 mb-2">⚡ En Trabajo (${operadoresOcupados.length})</h4>
        `;
        
        operadoresOcupados.forEach(op => {
            const div = document.createElement("div");
            div.className = "p-3 bg-blue-50 border border-blue-200 rounded mb-2";
            div.innerHTML = `
                <div class="font-semibold text-blue-700">${op.especialidad}</div>
                <div class="text-sm">${op.nombre}</div>
                <div class="text-xs text-blue-600">⚡ ${op.tarea_asignada || 'En trabajo'}</div>
            `;
            divOcupados.appendChild(div);
        });
        
        contenedor.appendChild(divOcupados);
    }

    // Si solo hay disponibles o solo ocupados, mostrar mensaje motivacional
    if (operadoresDisponibles.length === 0 && operadoresOcupados.length > 0) {
        const divInfo = document.createElement("div");
        divInfo.className = "mt-4 p-3 bg-blue-50 border border-blue-200 rounded";
        divInfo.innerHTML = `
            <div class="text-center text-blue-700">
                <p class="text-sm">🏃‍♂️ Todos los operadores están trabajando</p>
            </div>
        `;
        contenedor.appendChild(divInfo);
    } else if (operadoresDisponibles.length > 0 && operadoresOcupados.length === 0) {
        const divInfo = document.createElement("div");
        divInfo.className = "mt-4 p-3 bg-green-50 border border-green-200 rounded";
        divInfo.innerHTML = `
            <div class="text-center text-green-700">
                <p class="text-sm">😴 Todos los operadores están disponibles</p>
            </div>
        `;
        contenedor.appendChild(divInfo);
    }
}

/**
 * Renderizar panel de gestión de operadores
 */
function renderizarGestionOperadores(contenedor) {
    console.log("🎨 Renderizando gestión de operadores...");
    contenedor.innerHTML = "";

    // Botón para agregar nuevo operador
    const headerDiv = document.createElement("div");
    headerDiv.className = "flex justify-between items-center mb-4";
    headerDiv.innerHTML = `
        <h4 class="text-lg font-semibold">Gestión de Operadores</h4>
        <button onclick="mostrarFormularioOperador('crear')" 
                class="bg-teal-600 text-white px-3 py-1 rounded text-sm hover:bg-teal-700">
            ➕ Nuevo Operador
        </button>
    `;
    contenedor.appendChild(headerDiv);

    // Lista de operadores
    if (Array.isArray(operadoresData) && operadoresData.length > 0) {
        operadoresData.forEach(op => {
            const div = document.createElement("div");
            div.className = "p-4 bg-gray-50 rounded border mb-3";
            
            const estadoIcon = getEstadoIcon(op.estado);
            const estadoClass = getEstadoClass(op.estado);
            
            div.innerHTML = `
                <div class="flex justify-between items-start">
                    <div class="flex-1">
                        <div class="flex items-center gap-2 mb-1">
                            <span class="font-semibold text-lg">${op.nombre}</span>
                            <span class="px-2 py-1 rounded text-xs ${estadoClass}">
                                ${estadoIcon} ${op.estado}
                            </span>
                        </div>
                        <div class="text-sm text-gray-600 mb-1">
                            <strong>Especialidad:</strong> ${op.especialidad}
                        </div>
                        <div class="text-sm text-gray-600">
                            <strong>Tarea:</strong> ${op.tarea_asignada || 'Sin asignar'}
                        </div>
                    </div>
                    <div class="flex flex-col gap-1 ml-4">
                        ${op.estado === 'disponible' ? `
                            <button onclick="mostrarAsignadorTareas(${op.id}, '${op.nombre}')" 
                                    class="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600">
                                🎯 Asignar Tarea
                            </button>
                        ` : `
                            <button onclick="removerTarea(${op.id}, '${op.nombre}')" 
                                    class="bg-orange-500 text-white px-3 py-1 rounded text-xs hover:bg-orange-600">
                                🔄 Liberar
                            </button>
                        `}
                        <button onclick="mostrarFormularioOperador('editar', ${op.id})" 
                                class="bg-yellow-500 text-white px-3 py-1 rounded text-xs hover:bg-yellow-600">
                            ✏️ Editar
                        </button>
                        <button onclick="eliminarOperador(${op.id}, '${op.nombre}')" 
                                class="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700">
                            🗑️ Eliminar
                        </button>
                    </div>
                </div>
            `;
            contenedor.appendChild(div);
        });
    } else {
        contenedor.innerHTML += `
            <div class="text-center text-gray-500 py-8">
                <p>👥 No hay operadores registrados.</p>
                <button onclick="mostrarFormularioOperador('crear')" 
                        class="bg-teal-600 text-white px-4 py-2 rounded mt-4 hover:bg-teal-700">
                    Agregar Primer Operador
                </button>
            </div>
        `;
    }
}

/**
 * Actualizar estadísticas
 */
function actualizarEstadisticas() {
    if (!Array.isArray(operadoresData)) return;
    
    const disponibles = operadoresData.filter(op => op.estado === 'disponible').length;
    const ocupados = operadoresData.filter(op => op.estado === 'ocupado').length;
    const especialidades = [...new Set(operadoresData.map(op => op.especialidad))].length;
    const total = operadoresData.length;

    console.log(`📊 Estadísticas: ${disponibles} disponibles, ${ocupados} ocupados, ${especialidades} especialidades, ${total} total`);

    // Actualizar elementos de estadísticas si existen
    const statElements = {
        'stat-disponibles': disponibles,
        'stat-ocupados': ocupados,
        'stat-especialidades': especialidades,
        'stat-total': total
    };

    Object.entries(statElements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    });
}

/**
 * Mostrar modal para asignar tareas
 */
function mostrarAsignadorTareas(operadorId, nombreOperador) {
    console.log(`🎯 Mostrando asignador para operador ${operadorId}: ${nombreOperador}`);
    
    if (!Array.isArray(tareasDisponibles) || tareasDisponibles.length === 0) {
        alert("No hay tareas disponibles para asignar. Verifique que existan tareas en la base de datos.");
        return;
    }

    const modal = crearModal();
    const content = modal.querySelector('.modal-content');
    
    content.innerHTML = `
        <h3 class="text-xl font-semibold mb-4">🎯 Asignar Tarea</h3>
        <p class="mb-4">Operador: <strong>${nombreOperador}</strong></p>
        
        <div class="space-y-4">
            <div>
                <label class="block text-sm font-medium mb-2">Tarea:</label>
                <select id="selectTarea" class="w-full p-2 border rounded">
                    <option value="">Seleccionar tarea...</option>
                    ${tareasDisponibles.map(t => 
                        `<option value="${t.id}">${t.nombre}${t.descripcion ? ' - ' + t.descripcion : ''}</option>`
                    ).join('')}
                </select>
            </div>
            
            <div>
                <label class="block text-sm font-medium mb-2">Línea de Producción:</label>
                <select id="selectLinea" class="w-full p-2 border rounded">
                    <option value="Línea General">Línea General</option>
                    <option value="Línea A">Línea A</option>
                    <option value="Línea B">Línea B</option>
                    <option value="Línea C">Línea C</option>
                    <option value="Línea de Acabado">Línea de Acabado</option>
                </select>
            </div>
            
            <div>
                <label class="block text-sm font-medium mb-2">Pedido (Opcional):</label>
                <input type="text" id="inputPedido" placeholder="Ej: PED-00123" 
                       class="w-full p-2 border rounded">
            </div>
        </div>
        
        <div class="flex justify-end space-x-3 mt-6">
            <button onclick="cerrarModal()" 
                    class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
                Cancelar
            </button>
            <button onclick="confirmarAsignacionTarea(${operadorId})" 
                    class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                🎯 Asignar
            </button>
        </div>
    `;

    document.body.appendChild(modal);
}

/**
 * Confirmar asignación de tarea
 */
async function confirmarAsignacionTarea(operadorId) {
    const tareaId = document.getElementById("selectTarea").value;
    const lineaProduccion = document.getElementById("selectLinea").value;
    const pedido = document.getElementById("inputPedido").value.trim();

    if (!tareaId) {
        alert("Por favor seleccione una tarea");
        return;
    }

    const btnAsignar = document.querySelector('button[onclick*="confirmarAsignacionTarea"]');
    const textoOriginal = btnAsignar.textContent;
    btnAsignar.textContent = "Asignando...";
    btnAsignar.disabled = true;

    console.log("📤 Asignando tarea:", { operadorId, tareaId, lineaProduccion, pedido });

    try {
        const response = await fetch("api/tareas/operadores.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                accion: "asignar_tarea",
                operador_id: operadorId,
                tarea_id: parseInt(tareaId),
                linea_produccion: lineaProduccion,
                pedido: pedido || null
            })
        });

        const data = await response.json();
        console.log("📦 Respuesta asignación:", data);

        if (data.success) {
            mostrarExito(data.message);
            cerrarModal();
            await cargarOperadores(); // Recargar lista
        } else {
            mostrarError(data.error || "Error al asignar tarea");
        }

    } catch (error) {
        console.error("❌ Error asignando tarea:", error);
        mostrarError("Error de conexión al asignar tarea");
    } finally {
        btnAsignar.textContent = textoOriginal;
        btnAsignar.disabled = false;
    }
}

/**
 * Remover tarea de un operador
 */
async function removerTarea(operadorId, nombreOperador) {
    if (!confirm(`¿Está seguro de liberar a ${nombreOperador} de su tarea actual?`)) {
        return;
    }

    console.log("🔄 Removiendo tarea del operador:", operadorId);

    try {
        const response = await fetch("api/tareas/operadores.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                accion: "remover_tarea",
                operador_id: operadorId
            })
        });

        const data = await response.json();
        console.log("📦 Respuesta remoción:", data);

        if (data.success) {
            mostrarExito(data.message);
            await cargarOperadores();
        } else {
            mostrarError(data.error || "Error al remover tarea");
        }

    } catch (error) {
        console.error("❌ Error removiendo tarea:", error);
        mostrarError("Error de conexión al remover tarea");
    }
}

/**
 * Mostrar formulario para crear/editar operador
 */
function mostrarFormularioOperador(modo, operadorId = null) {
    console.log(`📝 Mostrando formulario: ${modo}`, operadorId);
    
    const modal = crearModal();
    const content = modal.querySelector('.modal-content');
    
    const operador = operadorId ? operadoresData.find(op => op.id === operadorId) : null;
    const titulo = modo === 'crear' ? 'Nuevo Operador' : 'Editar Operador';
    
    content.innerHTML = `
        <h3 class="text-xl font-semibold mb-4">${titulo}</h3>
        
        <div class="space-y-4">
            <div>
                <label class="block text-sm font-medium mb-2">Nombre Completo:</label>
                <input type="text" id="inputNombre" 
                       value="${operador ? operador.nombre : ''}" 
                       placeholder="Ej: María González" 
                       class="w-full p-2 border rounded">
            </div>
            
            <div>
                <label class="block text-sm font-medium mb-2">Especialidad:</label>
                <select id="selectEspecialidad" class="w-full p-2 border rounded">
                    <option value="">Seleccionar especialidad...</option>
                    <option value="Corte" ${operador && operador.especialidad === 'Corte' ? 'selected' : ''}>Corte</option>
                    <option value="Costura" ${operador && operador.especialidad === 'Costura' ? 'selected' : ''}>Costura</option>
                    <option value="Acabado" ${operador && operador.especialidad === 'Acabado' ? 'selected' : ''}>Acabado</option>
                    <option value="Planchado" ${operador && operador.especialidad === 'Planchado' ? 'selected' : ''}>Planchado</option>
                    <option value="Control Calidad" ${operador && operador.especialidad === 'Control Calidad' ? 'selected' : ''}>Control de Calidad</option>
                    <option value="Empaque" ${operador && operador.especialidad === 'Empaque' ? 'selected' : ''}>Empaque</option>
                </select>
            </div>
            
            ${modo === 'editar' && operador ? `
                <div class="bg-gray-50 p-3 rounded">
                    <p class="text-sm text-gray-600">
                        <strong>Estado Actual:</strong> ${getEstadoIcon(operador.estado)} ${operador.estado}
                        ${operador.tarea_asignada ? `<br><strong>Tarea:</strong> ${operador.tarea_asignada}` : ''}
                    </p>
                </div>
            ` : ''}
        </div>
        
        <div class="flex justify-end space-x-3 mt-6">
            <button onclick="cerrarModal()" 
                    class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
                Cancelar
            </button>
            <button onclick="guardarOperador('${modo}', ${operadorId || 'null'})" 
                    class="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700">
                ${modo === 'crear' ? '➕ Crear' : '💾 Guardar'}
            </button>
        </div>
    `;

    document.body.appendChild(modal);
}

/**
 * Guardar operador (crear o actualizar)
 */
async function guardarOperador(modo, operadorId) {
    const nombre = document.getElementById("inputNombre").value.trim();
    const especialidad = document.getElementById("selectEspecialidad").value;

    console.log(`💾 Guardando operador: ${modo}`, { nombre, especialidad, operadorId });

    // Validaciones
    if (!nombre) {
        alert("El nombre es requerido");
        return;
    }

    if (nombre.length < 2) {
        alert("El nombre debe tener al menos 2 caracteres");
        return;
    }

    if (!especialidad) {
        alert("La especialidad es requerida");
        return;
    }

    // Validar nombre único
    const nombreExiste = operadoresData.find(op => 
        op.nombre.toLowerCase() === nombre.toLowerCase() && op.id !== operadorId
    );
    
    if (nombreExiste) {
        alert("Ya existe un operador con ese nombre");
        return;
    }

    const btnGuardar = document.querySelector(`button[onclick*="guardarOperador"]`);
    const textoOriginal = btnGuardar.textContent;
    btnGuardar.textContent = "Guardando...";
    btnGuardar.disabled = true;

    try {
        const payload = {
            accion: modo === 'crear' ? 'crear' : 'actualizar',
            nombre: nombre,
            especialidad: especialidad
        };

        if (modo === 'actualizar') {
            payload.id = operadorId;
        }

        console.log("📤 Enviando datos:", payload);

        const response = await fetch("api/tareas/operadores.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        console.log("📦 Respuesta guardado:", data);

        if (data.success) {
            mostrarExito(data.message);
            cerrarModal();
            await cargarOperadores();
        } else {
            mostrarError(data.error || "Error al guardar operador");
        }

    } catch (error) {
        console.error("❌ Error guardando operador:", error);
        mostrarError("Error de conexión al guardar operador");
    } finally {
        btnGuardar.textContent = textoOriginal;
        btnGuardar.disabled = false;
    }
}

/**
 * Eliminar operador
 */
async function eliminarOperador(operadorId, nombreOperador) {
    console.log(`🗑️ Intentando eliminar operador: ${operadorId} - ${nombreOperador}`);
    
    const operador = operadoresData.find(op => op.id === operadorId);
    
    if (operador && operador.tarea_asignada) {
        alert(`No se puede eliminar a ${nombreOperador} porque tiene una tarea asignada. Libere la tarea primero.`);
        return;
    }

    if (!confirm(`⚠️ ¿Está seguro de eliminar al operador ${nombreOperador}?\n\nEsta acción no se puede deshacer.`)) {
        return;
    }

    try {
        const response = await fetch("api/tareas/operadores.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                accion: "eliminar",
                id: operadorId
            })
        });

        const data = await response.json();
        console.log("📦 Respuesta eliminación:", data);

        if (data.success) {
            mostrarExito(data.message);
            await cargarOperadores();
        } else {
            mostrarError(data.error || "Error al eliminar operador");
        }

    } catch (error) {
        console.error("❌ Error eliminando operador:", error);
        mostrarError("Error de conexión al eliminar operador");
    }
}

// === FUNCIONES DE UTILIDAD ===

function getEstadoIcon(estado) {
    switch (estado) {
        case 'disponible': return '✅';
        case 'ocupado': return '⚡';
        case 'descanso': return '☕';
        case 'ausente': return '🚫';
        default: return '❓';
    }
}

function getEstadoClass(estado) {
    switch (estado) {
        case 'disponible': return 'bg-green-100 text-green-800';
        case 'ocupado': return 'bg-blue-100 text-blue-800';
        case 'descanso': return 'bg-yellow-100 text-yellow-800';
        case 'ausente': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
}

function crearModal() {
    const modal = document.createElement("div");
    modal.className = "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";
    modal.innerHTML = `
        <div class="modal-content bg-white p-6 rounded shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <!-- Contenido será insertado aquí -->
        </div>
    `;
    return modal;
}

function cerrarModal() {
    const modal = document.querySelector('.fixed.inset-0');
    if (modal) {
        document.body.removeChild(modal);
    }
}

function mostrarExito(mensaje) {
    console.log("✅", mensaje);
    if (typeof mostrarNotificacion === 'function') {
        mostrarNotificacion(mensaje, 'success');
    } else {
        alert("✅ " + mensaje);
    }
}

function mostrarError(mensaje) {
    console.error("❌", mensaje);
    if (typeof mostrarNotificacion === 'function') {
        mostrarNotificacion(mensaje, 'error');
    } else {
        alert("❌ " + mensaje);
    }
}

// === INTEGRACIÓN CON SISTEMA PRINCIPAL ===

function cargarOperadoresSistema() {
    return cargarOperadores();
}

function asignarTarea(operadorId, nombreOperador) {
    mostrarAsignadorTareas(operadorId, nombreOperador);
}

function gestionarOperador(operadorId, nombreOperador, especialidad) {
    const jerarquia = localStorage.getItem("jerarquiaUsuario");
    
    if (jerarquia !== "1") {
        alert("No tiene permisos para gestionar operadores");
        return;
    }
    
    mostrarFormularioOperador('editar', operadorId);
}

// === INICIALIZACIÓN ===

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (document.getElementById("contenedor-operadores")) {
            console.log("🚀 DOM listo, inicializando operadores...");
            inicializarOperadores();
        }
    });
} else {
    if (document.getElementById("contenedor-operadores")) {
        console.log("🚀 DOM ya listo, inicializando operadores...");
        inicializarOperadores();
    }
}

// Hacer funciones disponibles globalmente
window.inicializarOperadores = inicializarOperadores;
window.cargarOperadores = cargarOperadores;
window.cargarOperadoresSistema = cargarOperadoresSistema;
window.asignarTarea = asignarTarea;
window.gestionarOperador = gestionarOperador;
window.mostrarFormularioOperador = mostrarFormularioOperador;