<?php
// registrar_pedido.php
require_once '../../conexion.php';

$data = json_decode(file_get_contents("php://input"), true);

$cliente = $data['cliente'] ?? '';
$cantidad = $data['cantidad'] ?? 0;
$fecha_registro = $data['fecha_registro'] ?? date('Y-m-d');
$fecha_entrega = $data['fecha_entrega'] ?? '';
$producto_id = $data['producto_id'] ?? 0;

if (!$cliente || !$cantidad || !$fecha_entrega || !$producto_id) {
    echo json_encode(["success" => false, "error" => "Faltan datos obligatorios"]);
    exit;
}

$conn = new mysqli("localhost", "u984575157_root", "TuContrasenaAqui", "u984575157_sistema_taller");
if ($conn->connect_error) {
    echo json_encode(["success" => false, "error" => $conn->connect_error]);
    exit;
}

$stmt = $conn->prepare("INSERT INTO pedido (cliente, cantidad, fecha_registro, fecha_entrega, producto_id) VALUES (?, ?, ?, ?, ?)");
$stmt->bind_param("sissi", $cliente, $cantidad, $fecha_registro, $fecha_entrega, $producto_id);

if ($stmt->execute()) {
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["success" => false, "error" => $stmt->error]);
}

$stmt->close();
$conn->close();
