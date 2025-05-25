
async function cargarProductos() {
  try {
    const res = await fetch("api/fichas/get_fichas_select.php");
    const productos = await res.json();

    const select = document.getElementById("selectFichaPedido");
    if (!select) {
      console.warn("No se encontró el select con id 'selectFichaPedido'");
      return;
    }

    // Limpiar el select antes de agregar nuevas opciones
    select.innerHTML = '<option value="">Seleccione un producto</option>';

    if (Array.isArray(productos) && productos.length > 0) {
      productos.forEach(p => {
        const option = document.createElement("option");
        option.value = p.id;
        option.textContent = p.nombre;
        select.appendChild(option);
      });
    } else {
      console.warn("No se encontraron productos en la base de datos.");
    }

  } catch (err) {
    console.error("Error al cargar productos desde FichaTec:", err);
  }
}
