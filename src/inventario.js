


export function cargarInventario() {
  fetch("api/inventario/get_inventario.php")
    .then(res => res.json())
    .then(data => {
      const tabla = document.getElementById("tablaInventario");
      if (!tabla) return console.warn("tablaInventario no encontrada");
      const tbody = tabla.querySelector("tbody");
      tbody.innerHTML = "";
      data.forEach(m => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
          <td class="border px-4 py-2">${m.id}</td>
          <td class="border px-4 py-2">${m.nombre}</td>
          <td class="border px-4 py-2">${m.cantidad}</td>
          <td class="border px-4 py-2">${m.cantidad_minima}</td>
          <td class="border px-4 py-2">
            <button onclick="mostrarFormularioInventario('editar', ${m.id})" class="text-blue-500">Editar</button>
            <button onclick="eliminarMaterial(${m.id})" class="text-red-500 ml-2">Eliminar</button>
          </td>
        `;
        tbody.appendChild(fila);
      });
    })
    .catch(err => {
      console.error("Error cargando inventario:", err);
      alert("No se pudo cargar el inventario.");
    });
}

export function mostrarFormularioInventario(modo, id = null) {
  const form = document.getElementById("formInventarioContainer");
  const titulo = document.getElementById("tituloFormInventario");
  form.classList.remove("hidden");
  titulo.textContent = modo === "agregar" ? "Agregar Material" : "Editar Material";
  document.getElementById("modoInventario").value = modo;
  document.getElementById("idMaterial").value = id || "";
}

export function eliminarMaterial(id) {
  if (confirm("¿Estás seguro de que deseas eliminar este material?")) {
    fetch(`api/inventario/eliminar_material.php?id=${id}`, { method: "DELETE" })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert("Material eliminado correctamente.");
          cargarInventario();
        } else {
          alert("Error al eliminar el material.");
        }
      })
      .catch(err => console.error("Error al eliminar material:", err));
  }
}

export function generarReportePDF() {
  const tabla = document.getElementById("tablaInventario");
  if (!tabla) {
    alert("No se encontró la tabla de inventario.");
    return;
  }

  const doc = new jspdf.jsPDF();
  doc.text("Reporte de Inventario", 14, 16);
  doc.autoTable({ html: "#tablaInventario", startY: 20 });
  doc.save("reporte_inventario.pdf");
}