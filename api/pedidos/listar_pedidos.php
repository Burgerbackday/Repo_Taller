<?php
header('Content-Type: application/json');

require_once '../conexion.php'; // Asegúrate que la ruta es correcta

try {
    $sql = "SELECT idpedi, nombrecliente, cantidad, fecha_registro, fecha_entrega, pro_nombre FROM Pedidos ORDER BY fecha_registro DESC";
    $result = $conn->query($sql);

    $pedidos = [];
    while ($row = $result->fetch_assoc()) {
        $pedidos[] = [
            'idpedi' => $row['idpedi'],
            'nombrecliente' => $row['nombrecliente'],
            'cantidad' => $row['cantidad'],
            'fecha_registro' => $row['fecha_registro'],
            'fecha_entrega' => $row['fecha_entrega'],
            'pro_nombre' => $row['pro_nombre']
        ];
    }

    echo json_encode($pedidos);
} catch (Exception $e) {
    echo json_encode(['error' => 'Error fetching data: ' . $e->getMessage()]);
}
$conn->close();
?>
