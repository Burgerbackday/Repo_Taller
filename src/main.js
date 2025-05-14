
import { cargarFichas, editarFicha, eliminarFicha } from './fichas.js';
import { cargarInventario } from './inventario.js';



document.addEventListener("DOMContentLoaded", () => {
    const nombreUsuario = localStorage.getItem("nombreUsuario");
    const jerarquiaUsuario = localStorage.getItem("jerarquiaUsuario");
  
    const content = document.getElementById("content");
    const botones = {
      resumen: document.getElementById("btn-resumen"),
      logistica: document.getElementById("btn-logistica"),
      fichas: document.getElementById("btn-fichas"),
      pedidos: document.getElementById("btn-pedidos")
    };
  
    function mostrarSeccion(nombre) {
      for (let btn in botones) {
        botones[btn]?.classList.remove("text-teal-600");
      }
      botones[nombre]?.classList.add("text-teal-600");
  
      if (secciones[nombre]) {
        content.innerHTML = secciones[nombre];
      }
  
      if (nombre === "resumen") {
        cargarGraficoDisponibilidad();
        cargarGraficoPedidos();
      }
  
      if (nombre === "logistica") {
        cargarInventario();
      }

      if (nombre === "fichas") {
        cargarFichas();
      }
  
      if (nombre === "pedidos") {
        cargarProductos();
        cargarPedidos();
        document.getElementById("formPedido")?.addEventListener("submit", async (e) => {
          e.preventDefault();
          const datos = {
            cliente: document.getElementById("cliente").value,
            cantidad: document.getElementById("cantidad").value,
            fecha_registro: document.getElementById("fechaRegistro").value,
            fecha_entrega: document.getElementById("fechaEntrega").value,
            producto: document.getElementById("producto").value
          };
          try {
            const res = await fetch("api/pedidos/registrar_pedido.php", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(datos)
            });
            const result = await res.json();
            if (result.success) {
              alert("Pedido registrado exitosamente.");
              cargarPedidos();
              document.getElementById("formPedido").reset();
            } else {
              alert("Error: " + result.error);
            }
          } catch (err) {
            console.error("Error al registrar pedido:", err);
          }
        });
      }
    }
  
    window.mostrarSeccion = mostrarSeccion;
    mostrarSeccion("resumen");
  });