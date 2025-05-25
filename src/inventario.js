// === GESTIÓN DE INVENTARIO CON REABASTECIMIENTO ===

let alertasCriticasInterval = null;

// Cargar inventario desde la API
function cargarInventario() {
    fetch("api/inventario/get_inventario.php")
        .then(res => {
            if (!res.ok) throw new Error("Error al conectar con la API");
            return res.json();
        })
        .then(data => {
            const tbody = document.getElementById("tablaInventarioBody");
            if (!tbody) return;

            tbody.innerHTML = "";

            if (data.success && Array.isArray(data.data)) {
                data.data.forEach(item => {
                    const tr = document.createElement("tr");
                    tr.className = "border-t hover:bg-gray-50";
                    
                    // Determinar estado y clases CSS
                    const estadoInfo = getEstadoInfo(item.cantidad_disp, item.cantidad_min);
                    
                    tr.innerHTML = `
                        <td class="p-2 border">${item.id}</td>
                        <td class="p-2 border">
                            <div class="flex items-center gap-2">
                                ${estadoInfo.icon}
                                <span>${item.Material}</span>
                            </div>
                        </td>
                        <td class="p-2 border text-center">
                            <span class="font-semibold ${estadoInfo.cantidadClass}">
                                ${item.cantidad_disp}
                            </span>
                        </td>
                        <td class="p-2 border text-center text-gray-600">${item.cantidad_min}</td>
                        <td class="p-2 border">
                            <span class="px-2 py-1 rounded text-xs font-medium ${estadoInfo.estadoClass}">
                                ${item.estado}
                            </span>
                        </td>
                        <td class="p-2 border">
                            <div class="flex gap-1">
                                <button onclick="mostrarReabastecimiento(${item.id}, '${item.Material}', ${item.cantidad_disp}, ${item.cantidad_min})" 
                                        class="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700">
                                    📦 Reabastecer
                                </button>
                                <button onclick="editarCantidadMinima(${item.id}, '${item.Material}', ${item.cantidad_min})" 
                                        class="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600">
                                    ⚙️ Min
                                </button>
                                <button onclick="eliminarMaterial(${item.id})" 
                                        class="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700">
                                    🗑️
                                </button>
                            </div>
                        </td>
                    `;
                    tbody.appendChild(tr);
                });

                // Verificar alertas críticas
                verificarAlertas(data.data);
            } else {
                tbody.innerHTML = `<tr><td colspan="6" class="p-4 text-center text-gray-500">No hay materiales en inventario</td></tr>`;
            }
        })
        .catch(err => {
            console.error("Error cargando inventario:", err);
            const tbody = document.getElementById("tablaInventarioBody");
            if (tbody) {
                tbody.innerHTML = `<tr><td colspan="6" class="p-4 text-center text-red-500">Error al cargar inventario</td></tr>`;
            }
        });
}

// Obtener información de estado y estilos
function getEstadoInfo(cantidadActual, cantidadMinima) {
    const cantidad = parseInt(cantidadActual);
    const minimo = parseInt(cantidadMinima);
    
    if (cantidad === 0) {
        return {
            icon: '🚨',
            cantidadClass: 'text-red-700',
            estadoClass: 'bg-red-100 text-red-800 border border-red-300',
            nivel: 'AGOTADO'
        };
    } else if (cantidad <= minimo) {
        return {
            icon: '⚠️',
            cantidadClass: 'text-orange-700',
            estadoClass: 'bg-orange-100 text-orange-800 border border-orange-300',
            nivel: 'CRÍTICO'
        };
    } else if (cantidad <= (minimo * 1.5)) {
        return {
            icon: '🟨',
            cantidadClass: 'text-yellow-700',
            estadoClass: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
            nivel: 'BAJO'
        };
    } else {
        return {
            icon: '✅',
            cantidadClass: 'text-green-700',
            estadoClass: 'bg-green-100 text-green-800 border border-green-300',
            nivel: 'NORMAL'
        };
    }
}

// Verificar materiales que necesitan reabastecimiento
function verificarAlertas(inventario) {
    const materialesCriticos = inventario.filter(item => {
        const cantidad = parseInt(item.cantidad_disp);
        const minimo = parseInt(item.cantidad_min);
        return cantidad <= minimo;
    });

    if (materialesCriticos.length > 0) {
        mostrarAlertaCritica(materialesCriticos);
    }
}

// Mostrar alerta de materiales críticos
function mostrarAlertaCritica(materialesCriticos) {
    // Solo mostrar si no hay una alerta activa
    if (document.getElementById('alerta-critica')) return;

    const alerta = document.createElement('div');
    alerta.id = 'alerta-critica';
    alerta.className = 'fixed top-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm';
    
    const agotados = materialesCriticos.filter(m => m.cantidad_disp === 0);
    const criticos = materialesCriticos.filter(m => m.cantidad_disp > 0 && m.cantidad_disp <= m.cantidad_min);
    
    alerta.innerHTML = `
        <div class="flex items-start gap-3">
            <div class="text-2xl">🚨</div>
            <div class="flex-1">
                <h4 class="font-bold mb-1">¡Alerta de Inventario!</h4>
                <p class="text-sm mb-2">
                    ${agotados.length > 0 ? `${agotados.length} materiales agotados` : ''}
                    ${agotados.length > 0 && criticos.length > 0 ? ' y ' : ''}
                    ${criticos.length > 0 ? `${criticos.length} materiales críticos` : ''}
                </p>
                <div class="flex gap-2">
                    <button onclick="mostrarPanelCriticos()" class="bg-white text-red-600 px-2 py-1 rounded text-xs font-medium">
                        Ver Detalles
                    </button>
                    <button onclick="cerrarAlerta()" class="bg-red-400 text-white px-2 py-1 rounded text-xs">
                        ✕
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(alerta);
    
    // Auto-cerrar después de 10 segundos
    setTimeout(() => {
        if (document.getElementById('alerta-critica')) {
            cerrarAlerta();
        }
    }, 10000);
}

// Cerrar alerta crítica
function cerrarAlerta() {
    const alerta = document.getElementById('alerta-critica');
    if (alerta) {
        alerta.remove();
    }
}

// Mostrar modal de reabastecimiento
function mostrarReabastecimiento(id, nombreMaterial, cantidadActual, cantidadMinima) {
    const modal = crearModal('Reabastecer Material');
    const content = modal.querySelector('.modal-content');
    
    const sugerencia = calcularSugerencia(cantidadActual, cantidadMinima);
    
    content.innerHTML = `
        <div class="text-center mb-4">
            <h3 class="text-xl font-semibold mb-2">📦 Reabastecer Material</h3>
            <div class="bg-blue-50 p-3 rounded">
                <p class="font-medium">${nombreMaterial}</p>
                <p class="text-sm text-gray-600">Cantidad actual: <span class="font-semibold">${cantidadActual}</span></p>
                <p class="text-sm text-gray-600">Cantidad mínima: <span class="font-semibold">${cantidadMinima}</span></p>
            </div>
        </div>
        
        <div class="space-y-4">
            <div>
                <label class="block text-sm font-medium mb-2">Cantidad a Agregar:</label>
                <input type="number" id="cantidadAgregar" 
                       value="${sugerencia}" 
                       min="1" max="50000"
                       class="w-full p-2 border rounded focus:ring-2 focus:ring-green-500">
                <p class="text-xs text-gray-500 mt-1">Sugerencia: ${sugerencia} unidades</p>
            </div>
            
            <div>
                <label class="block text-sm font-medium mb-2">Comentario (Opcional):</label>
                <textarea id="comentarioReabastecimiento" 
                          placeholder="Ej: Proveedor XYZ, Lote #123, etc."
                          class="w-full p-2 border rounded h-20 resize-none"></textarea>
            </div>
            
            <div class="bg-green-50 p-3 rounded">
                <p class="text-sm">
                    <strong>Resultado:</strong> 
                    <span id="cantidadFinal">${cantidadActual + sugerencia}</span> unidades totales
                </p>
            </div>
        </div>
        
        <div class="flex justify-end space-x-3 mt-6">
            <button onclick="cerrarModal()" 
                    class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
                Cancelar
            </button>
            <button onclick="confirmarReabastecimiento(${id}, '${nombreMaterial}', ${cantidadActual})" 
                    class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                📦 Reabastecer
            </button>
        </div>
    `;

    // Actualizar cantidad final en tiempo real
    const inputCantidad = content.querySelector('#cantidadAgregar');
    const spanFinal = content.querySelector('#cantidadFinal');
    
    inputCantidad.addEventListener('input', () => {
        const cantidad = parseInt(inputCantidad.value) || 0;
        spanFinal.textContent = cantidadActual + cantidad;
    });

    document.body.appendChild(modal);
}

// Calcular sugerencia de reabastecimiento
function calcularSugerencia(cantidadActual, cantidadMinima) {
    if (cantidadActual === 0) {
        return cantidadMinima * 3; // Si está agotado, 3x el mínimo
    } else if (cantidadActual <= cantidadMinima) {
        return Math.max(cantidadMinima * 2 - cantidadActual, cantidadMinima); // Hasta 2x el mínimo
    } else {
        return cantidadMinima; // Cantidad mínima básica
    }
}

// *** FUNCIÓN CORREGIDA PARA USAR TU API ***
async function confirmarReabastecimiento(id, nombreMaterial, cantidadActual) {
    const cantidad = parseInt(document.getElementById('cantidadAgregar').value);
    const comentario = document.getElementById('comentarioReabastecimiento').value.trim() || 'Reabastecimiento via sistema';

    if (!cantidad || cantidad <= 0) {
        alert('Por favor ingrese una cantidad válida');
        return;
    }

    if (cantidad > 50000) {
        alert('La cantidad máxima por reabastecimiento es 50,000');
        return;
    }

    const btnConfirmar = document.querySelector('button[onclick*="confirmarReabastecimiento"]');
    const textoOriginal = btnConfirmar.textContent;
    btnConfirmar.textContent = 'Reabasteciendo...';
    btnConfirmar.disabled = true;

    try {
        // *** USAR TU API DE REABASTECIMIENTO ***
        const formData = new FormData();
        formData.append('id_material', id);
        formData.append('cantidad', cantidad);
        formData.append('comentario', comentario);
        formData.append('usuario', 'Sistema');

        const response = await fetch('api/inventario/reabastecer_material.php', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            mostrarNotificacionExito(`✅ ${data.message}`, `
                <div class="text-sm mt-2">
                    <p><strong>Material:</strong> ${data.data.material}</p>
                    <p><strong>Cantidad anterior:</strong> ${data.data.cantidad_anterior}</p>
                    <p><strong>Cantidad agregada:</strong> +${data.data.cantidad_agregada}</p>
                    <p><strong>Cantidad nueva:</strong> ${data.data.cantidad_nueva}</p>
                    <p><strong>Estado:</strong> ${data.data.estado_anterior} → ${data.data.estado_nuevo}</p>
                </div>
            `);
            cerrarModal();
            cargarInventario(); // Recargar tabla
        } else {
            alert('Error: ' + (data.error || 'Error desconocido'));
        }

    } catch (error) {
        console.error('Error en reabastecimiento:', error);
        alert('Error de conexión con el servidor');
    } finally {
        btnConfirmar.textContent = textoOriginal;
        btnConfirmar.disabled = false;
    }
}

// Mostrar panel de materiales críticos (simplificado para usar tu estructura)
async function mostrarPanelCriticos() {
    try {
        // Obtener datos del inventario actual
        const response = await fetch('api/inventario/get_inventario.php');
        const data = await response.json();

        if (data.success) {
            // Filtrar materiales críticos
            const materialesCriticos = data.data.filter(item => {
                const cantidad = parseInt(item.cantidad_disp);
                const minimo = parseInt(item.cantidad_min);
                return cantidad <= minimo * 1.5; // Incluir críticos y bajos
            });

            const agotados = materialesCriticos.filter(m => m.cantidad_disp === 0);
            const criticos = materialesCriticos.filter(m => m.cantidad_disp > 0 && m.cantidad_disp <= m.cantidad_min);
            const bajos = materialesCriticos.filter(m => m.cantidad_disp > m.cantidad_min && m.cantidad_disp <= (m.cantidad_min * 1.5));

            const modal = crearModal('🚨 Materiales Críticos');
            const content = modal.querySelector('.modal-content');
            
            content.innerHTML = `
                <div class="mb-4">
                    <h3 class="text-xl font-semibold mb-2">🚨 Materiales que Requieren Atención</h3>
                    <div class="grid grid-cols-3 gap-4 mb-4">
                        <div class="bg-red-50 border border-red-200 p-3 rounded text-center">
                            <div class="text-2xl font-bold text-red-600">${agotados.length}</div>
                            <div class="text-sm text-red-700">Agotados</div>
                        </div>
                        <div class="bg-orange-50 border border-orange-200 p-3 rounded text-center">
                            <div class="text-2xl font-bold text-orange-600">${criticos.length}</div>
                            <div class="text-sm text-orange-700">Críticos</div>
                        </div>
                        <div class="bg-yellow-50 border border-yellow-200 p-3 rounded text-center">
                            <div class="text-2xl font-bold text-yellow-600">${bajos.length}</div>
                            <div class="text-sm text-yellow-700">Bajos</div>
                        </div>
                    </div>
                </div>
                
                <div class="max-h-96 overflow-y-auto">
                    ${materialesCriticos.length > 0 ? `
                        <table class="w-full text-sm">
                            <thead class="bg-gray-50 sticky top-0">
                                <tr>
                                    <th class="p-2 text-left">Material</th>
                                    <th class="p-2 text-center">Actual</th>
                                    <th class="p-2 text-center">Mín</th>
                                    <th class="p-2 text-center">Estado</th>
                                    <th class="p-2 text-center">Sugerencia</th>
                                    <th class="p-2 text-center">Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${materialesCriticos.map(material => {
                                    const estadoInfo = getEstadoInfo(material.cantidad_disp, material.cantidad_min);
                                    const sugerencia = calcularSugerencia(material.cantidad_disp, material.cantidad_min);
                                    return `
                                        <tr class="border-b hover:bg-gray-50">
                                            <td class="p-2">
                                                <div class="flex items-center gap-2">
                                                    ${estadoInfo.icon}
                                                    <span class="font-medium">${material.Material}</span>
                                                </div>
                                            </td>
                                            <td class="p-2 text-center font-semibold ${estadoInfo.cantidadClass}">
                                                ${material.cantidad_disp}
                                            </td>
                                            <td class="p-2 text-center text-gray-600">${material.cantidad_min}</td>
                                            <td class="p-2 text-center">
                                                <span class="px-2 py-1 rounded text-xs ${estadoInfo.estadoClass}">
                                                    ${estadoInfo.nivel}
                                                </span>
                                            </td>
                                            <td class="p-2 text-center font-semibold text-green-600">
                                                +${sugerencia}
                                            </td>
                                            <td class="p-2 text-center">
                                                <button onclick="cerrarModal(); mostrarReabastecimiento(${material.id}, '${material.Material}', ${material.cantidad_disp}, ${material.cantidad_min})" 
                                                        class="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700">
                                                    📦 Reabastecer
                                                </button>
                                            </td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    ` : `
                        <div class="text-center py-8 text-green-600">
                            <div class="text-4xl mb-2">✅</div>
                            <p class="font-medium">¡Excelente!</p>
                            <p class="text-sm">Todos los materiales tienen niveles adecuados</p>
                        </div>
                    `}
                </div>
                
                <div class="flex justify-end items-center mt-6">
                    <button onclick="cerrarModal()" 
                            class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
                        Cerrar
                    </button>
                </div>
            `;

            document.body.appendChild(modal);
            cerrarAlerta(); // Cerrar la alerta flotante
        }

    } catch (error) {
        console.error('Error cargando materiales críticos:', error);
        alert('Error al cargar materiales críticos');
    }
}

// Editar cantidad mínima (manteniendo tu lógica original)
function editarCantidadMinima(id, nombreMaterial, cantidadMinActual) {
    const modal = crearModal('Actualizar Cantidad Mínima');
    const content = modal.querySelector('.modal-content');
    
    content.innerHTML = `
        <div class="text-center mb-4">
            <h3 class="text-xl font-semibold mb-2">⚙️ Cantidad Mínima</h3>
            <div class="bg-blue-50 p-3 rounded">
                <p class="font-medium">${nombreMaterial}</p>
                <p class="text-sm text-gray-600">Cantidad mínima actual: <span class="font-semibold">${cantidadMinActual}</span></p>
            </div>
        </div>
        
        <div class="space-y-4">
            <div>
                <label class="block text-sm font-medium mb-2">Nueva Cantidad Mínima:</label>
                <input type="number" id="nuevaCantidadMin" 
                       value="${cantidadMinActual}" 
                       min="0" max="10000"
                       class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500">
                <p class="text-xs text-gray-500 mt-1">Esta cantidad determinará las alertas de reabastecimiento</p>
            </div>
            
            <div class="bg-yellow-50 border border-yellow-200 p-3 rounded">
                <p class="text-sm text-yellow-800">
                    <strong>💡 Consejo:</strong> Establezca la cantidad mínima considerando el tiempo de reabastecimiento 
                    y el consumo promedio del material.
                </p>
            </div>
        </div>
        
        <div class="flex justify-end space-x-3 mt-6">
            <button onclick="cerrarModal()" 
                    class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
                Cancelar
            </button>
            <button onclick="confirmarCantidadMinima(${id}, '${nombreMaterial}')" 
                    class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                ⚙️ Actualizar
            </button>
        </div>
    `;

    document.body.appendChild(modal);
}

// Confirmar actualización de cantidad mínima (usar tu API existente)
async function confirmarCantidadMinima(id, nombreMaterial) {
    const nuevaCantidad = parseInt(document.getElementById('nuevaCantidadMin').value);

    if (isNaN(nuevaCantidad) || nuevaCantidad < 0) {
        alert('Por favor ingrese una cantidad válida');
        return;
    }

    const btnConfirmar = document.querySelector('button[onclick*="confirmarCantidadMinima"]');
    const textoOriginal = btnConfirmar.textContent;
    btnConfirmar.textContent = 'Actualizando...';
    btnConfirmar.disabled = true;

    try {
        // Usar tu API existente para actualizar
        const response = await fetch("api/inventario/update_material.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                accion: "editar",
                id: parseInt(id),
                cantidad_min: nuevaCantidad
            })
        });

        const data = await response.json();

        if (data.success) {
            mostrarNotificacion(`Cantidad mínima actualizada para ${nombreMaterial}`, 'success');
            cerrarModal();
            cargarInventario(); // Recargar tabla
        } else {
            alert('Error: ' + (data.error || 'Error desconocido'));
        }

    } catch (error) {
        console.error('Error actualizando cantidad mínima:', error);
        alert('Error de conexión con el servidor');
    } finally {
        btnConfirmar.textContent = textoOriginal;
        btnConfirmar.disabled = false;
    }
}

// === MANTENER TODAS TUS FUNCIONES EXISTENTES ===

// Mostrar formulario de inventario (mantener funcionalidad existente)
function mostrarFormularioInventario(modo, id = null) {
    const modal = document.getElementById("formInventarioModal");
    const titulo = document.getElementById("tituloFormInventario");
    const modoInput = document.getElementById("modoInventario");
    const idInput = document.getElementById("idMaterial");

    if (!modal || !titulo || !modoInput || !idInput) {
        console.error("Elementos del modal no encontrados");
        return;
    }

    modal.classList.remove("hidden");
    modal.classList.add("flex");

    titulo.textContent = modo === "agregar" ? "Agregar Material" : "Editar Material";
    modoInput.value = modo;
    idInput.value = id || "";

    limpiarFormularioInventario();

    if (modo === "editar" && id) {
        console.log("Modo edición para ID:", id);
    }
}

// Limpiar campos del formulario
function limpiarFormularioInventario() {
    const campos = ["nombreMaterial", "cantidadDisponible", "cantidadMinima", "estadoMaterial"];
    campos.forEach(campo => {
        const elemento = document.getElementById(campo);
        if (elemento) elemento.value = "";
    });
}

// Cerrar modal de inventario
function cerrarModalInventario() {
    const modal = document.getElementById("formInventarioModal");
    if (modal) {
        modal.classList.add("hidden");
        modal.classList.remove("flex");
    }
}

// Guardar material
function guardarMaterial() {
    const modo = document.getElementById("modoInventario").value;
    const id = document.getElementById("idMaterial").value;
    const nombre = document.getElementById("nombreMaterial").value.trim();
    const cantidad = document.getElementById("cantidadDisponible").value.trim();
    const minima = document.getElementById("cantidadMinima").value.trim();
    const estado = document.getElementById("estadoMaterial").value.trim();

    if (!nombre || !cantidad || !minima || !estado) {
        alert("Por favor complete todos los campos.");
        return;
    }

    if (parseInt(cantidad) < 0 || parseInt(minima) < 0) {
        alert("Las cantidades no pueden ser negativas.");
        return;
    }

    const payload = {
        accion: modo,
        Material: nombre,
        cantidad_disp: parseInt(cantidad),
        cantidad_min: parseInt(minima),
        estado: estado
    };

    if (modo === "editar" && id) {
        payload.id = parseInt(id);
    }

    fetch("api/inventario/update_material.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                alert(data.message || "Material guardado correctamente");
                cerrarModalInventario();
                cargarInventario();
            } else {
                alert("Error: " + (data.error || "Error desconocido"));
            }
        })
        .catch(err => {
            console.error("Error:", err);
            alert("Error de conexión con el servidor");
        });
}

// Eliminar material
function eliminarMaterial(id) {
    if (!confirm("¿Está seguro de eliminar este material?")) {
        return;
    }

    fetch("api/inventario/update_material.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            accion: "eliminar",
            id: parseInt(id)
        })
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                alert(data.message || "Material eliminado correctamente");
                cargarInventario();
            } else {
                alert("Error: " + (data.error || "Error desconocido"));
            }
        })
        .catch(err => {
            console.error("Error:", err);
            alert("Error de conexión con el servidor");
        });
}

// Generar reporte PDF de inventario completo
function generarReportePDF() {
    const tabla = document.getElementById("tablaInventario");
    if (!tabla) {
        alert("No se encontró la tabla de inventario");
        return;
    }

    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        doc.text("📦 Reporte de Inventario Completo", 14, 16);
        doc.autoTable({ 
            html: "#tablaInventario", 
            startY: 20,
            theme: 'striped'
        });
        
        doc.save(`inventario_completo_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
        console.error("Error generando PDF:", err);
        alert("Error al generar el PDF. Verifique que las librerías estén cargadas.");
    }
}

// === FUNCIONES AUXILIARES ===

function crearModal(titulo) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="modal-content bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div class="p-6 overflow-y-auto max-h-[90vh]">
                <!-- Contenido se insertará aquí -->
            </div>
        </div>
    `;
    return modal;
}

function cerrarModal() {
    const modales = document.querySelectorAll('.fixed.inset-0');
    modales.forEach(modal => {
        if (modal.id !== 'formInventarioModal') { // No cerrar el modal principal de inventario
            modal.remove();
        }
    });
}

function mostrarNotificacion(mensaje, tipo = 'info') {
    if (typeof window.mostrarNotificacion === 'function') {
        window.mostrarNotificacion(mensaje, tipo);
    } else {
        // Crear notificación simple si no existe función global
        const notif = document.createElement('div');
        const colorClass = tipo === 'success' ? 'bg-green-500' : tipo === 'error' ? 'bg-red-500' : 'bg-blue-500';
        notif.className = `fixed bottom-4 right-4 ${colorClass} text-white p-4 rounded-lg shadow-lg z-50 max-w-sm`;
        notif.innerHTML = `
            <div class="flex justify-between items-start">
                <span>${mensaje}</span>
                <button onclick="this.parentElement.parentElement.remove()" class="ml-2 text-white hover:text-gray-200">
                    ✕
                </button>
            </div>
        `;
        document.body.appendChild(notif);
        
        setTimeout(() => {
            if (notif.parentElement) {
                notif.remove();
            }
        }, 5000);
    }
}

function mostrarNotificacionExito(titulo, contenido) {
    const notif = document.createElement('div');
    notif.className = 'fixed bottom-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm';
    notif.innerHTML = `
        <div class="font-semibold mb-1">${titulo}</div>
        ${contenido}
        <button onclick="this.parentElement.remove()" class="absolute top-2 right-2 text-white hover:text-gray-200">
            ✕
        </button>
    `;
    document.body.appendChild(notif);
    
    setTimeout(() => {
        if (notif.parentElement) {
            notif.remove();
        }
    }, 8000);
}

// Generar reporte de materiales críticos (simplificado)
function generarReporteCriticos() {
    fetch('api/inventario/get_inventario.php')
    .then(res => res.json())
    .then(data => {
        if (data.success && window.jspdf) {
            const materialesCriticos = data.data.filter(item => {
                const cantidad = parseInt(item.cantidad_disp);
                const minimo = parseInt(item.cantidad_min);
                return cantidad <= minimo * 1.5;
            });

            const agotados = materialesCriticos.filter(m => m.cantidad_disp === 0);
            const criticos = materialesCriticos.filter(m => m.cantidad_disp > 0 && m.cantidad_disp <= m.cantidad_min);
            const bajos = materialesCriticos.filter(m => m.cantidad_disp > m.cantidad_min && m.cantidad_disp <= (m.cantidad_min * 1.5));

            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            // Título
            doc.setFontSize(18);
            doc.text('🚨 REPORTE DE MATERIALES CRÍTICOS', 14, 20);
            
            // Fecha
            doc.setFontSize(10);
            doc.text(`Fecha: ${new Date().toLocaleDateString('es-MX')}`, 14, 30);
            doc.text(`Hora: ${new Date().toLocaleTimeString('es-MX')}`, 14, 35);
            
            // Resumen
            doc.setFontSize(12);
            doc.text('RESUMEN:', 14, 45);
            doc.setFontSize(10);
            doc.text(`• Materiales agotados: ${agotados.length}`, 20, 52);
            doc.text(`• Materiales críticos: ${criticos.length}`, 20, 57);
            doc.text(`• Materiales bajos: ${bajos.length}`, 20, 62);
            doc.text(`• Total materiales con problemas: ${materialesCriticos.length}`, 20, 67);
            
            // Tabla de datos
            if (materialesCriticos.length > 0) {
                const tableData = materialesCriticos.map(material => [
                    material.Material,
                    material.cantidad_disp.toString(),
                    material.cantidad_min.toString(),
                    material.estado,
                    calcularSugerencia(material.cantidad_disp, material.cantidad_min).toString()
                ]);

                doc.autoTable({
                    head: [['Material', 'Cantidad Actual', 'Cantidad Mínima', 'Estado', 'Sugerencia Pedido']],
                    body: tableData,
                    startY: 75,
                    theme: 'striped',
                    headStyles: { fillColor: [220, 53, 69] },
                    styles: { fontSize: 8 },
                    columnStyles: {
                        0: { cellWidth: 60 },
                        1: { cellWidth: 30, halign: 'center' },
                        2: { cellWidth: 30, halign: 'center' },
                        3: { cellWidth: 30, halign: 'center' },
                        4: { cellWidth: 30, halign: 'center' }
                    }
                });
            }
            
            // Pie de página
            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.text(`Página ${i} de ${pageCount}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10);
                doc.text('Sistema de Gestión - Taller de Confección', 14, doc.internal.pageSize.height - 10);
            }
            
            doc.save(`reporte_materiales_criticos_${new Date().toISOString().split('T')[0]}.pdf`);
        } else {
            alert('Error al generar el reporte PDF o jsPDF no está disponible');
        }
    })
    .catch(err => {
        console.error('Error generando reporte:', err);
        alert('Error al generar el reporte');
    });
}

// === INICIALIZACIÓN ===
document.addEventListener("DOMContentLoaded", () => {
    const btnCancelar = document.getElementById("btnCancelarInventario");
    if (btnCancelar) {
        btnCancelar.addEventListener("click", cerrarModalInventario);
    }

    const btnGuardar = document.getElementById("btnGuardarInventario");
    if (btnGuardar) {
        btnGuardar.addEventListener("click", guardarMaterial);
    }

    // Verificar alertas cada 5 minutos
    if (!alertasCriticasInterval) {
        alertasCriticasInterval = setInterval(() => {
            cargarInventario();
        }, 5 * 60 * 1000);
    }

    // Cargar inventario inicial
    cargarInventario();
});

// Hacer funciones disponibles globalmente
window.cargarInventario = cargarInventario;
window.mostrarFormularioInventario = mostrarFormularioInventario;
window.eliminarMaterial = eliminarMaterial;
window.generarReportePDF = generarReportePDF;
window.mostrarReabastecimiento = mostrarReabastecimiento;
window.editarCantidadMinima = editarCantidadMinima;
window.mostrarPanelCriticos = mostrarPanelCriticos;
window.generarReporteCriticos = generarReporteCriticos;
window.cerrarAlerta = cerrarAlerta;
window.confirmarReabastecimiento = confirmarReabastecimiento;
window.confirmarCantidadMinima = confirmarCantidadMinima;
window.cerrarModal = cerrarModal;