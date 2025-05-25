document.addEventListener("DOMContentLoaded", () => {
  esperarElementosDOM();
});

function esperarElementosDOM() {
  const form = document.getElementById("formPedido");
  const tabla = document.querySelector("#tablaPedidos");

  if (!form || !tabla) {
    console.log("⏳ Esperando a que el formulario y la tabla estén en el DOM...");
    setTimeout(esperarElementosDOM, 300);
    return;
  }

  // Ya existen ambos, agregar listener
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const cliente = document.getElementById("cliente").value.trim();
    const cantidad = document.getElementById("cantidad").value.trim();
    const fecha_registro = document.getElementById("fechaRegistro").value.trim();
    const fecha_entrega = document.getElementById("fechaEntrega").value.trim();
    const producto = document.getElementById("selectFichaPedido").value.trim();

    const datosPedido = {
      cliente,
      cantidad,
      fecha_registro,
      fecha_entrega,
      producto,
    };

    console.log("📤 Datos enviados al backend:", datosPedido);

    try {
      const res = await fetch("/api/pedidos/registrar_pedido.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(datosPedido)
      });

      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        const text = await res.text();
        throw new Error("Respuesta inesperada del servidor:\n" + text);
      }

      
    const text = await res.text();
    let result;
    try {
      result = JSON.parse(text);
    } catch (jsonErr) {
      throw new Error("Respuesta del servidor no es JSON válido:\n" + text);
    }
    
      console.log("✅ Respuesta del servidor:", result);

      if (result.success) {
        alert("Pedido registrado exitosamente.");
        form.reset();
        cargarPedidos(); // Recargar tabla
      } else {
        alert("Error: " + result.error);
      }
    } catch (err) {
      console.error("Error al registrar pedido:", err);
    }
  });

  cargarPedidos();
}

async function cargarPedidos() {
  const tabla = document.querySelector("#tablaPedidos");
  const tbody = tabla ? tabla.querySelector("tbody") : null;

  if (!tbody) {
    console.warn("⚠️ No se encontró la tabla de pedidos en el DOM.");
    return;
  }

  tbody.innerHTML = '<tr><td colspan="5" class="text-center">Cargando...</td></tr>';

  try {
    const res = await fetch("/api/pedidos/listar_pedidos.php");
    const pedidos = await res.json();

    if (!Array.isArray(pedidos)) {
      throw new Error("Respuesta inválida: " + JSON.stringify(pedidos));
    }

    if (pedidos.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-center">No hay pedidos registrados.</td></tr>';
      return;
    }

    tbody.innerHTML = "";
    for (const pedido of pedidos) {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${pedido.nombrecliente}</td>
        <td>${pedido.pro_nombre}</td>
        <td>${pedido.cantidad}</td>
        <td>${pedido.fecha_registro}</td>
        <td>${pedido.fecha_entrega}</td>
      `;
      tbody.appendChild(tr);
    }
  } catch (err) {
    console.error("Error al cargar pedidos:", err);
    tbody.innerHTML = '<tr><td colspan="5" class="text-center text-red-500">Error al cargar pedidos</td></tr>';
  }
}