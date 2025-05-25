<?php
header('Content-Type: application/json');
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once '../conexion.php';

$input = json_decode(file_get_contents("php://input"), true);
$campos_faltantes = [];

if (!isset($input['cliente']) || trim($input['cliente']) === "") $campos_faltantes[] = 'cliente';
if (!isset($input['cantidad']) || trim($input['cantidad']) === "") $campos_faltantes[] = 'cantidad';
if (!isset($input['fecha_registro']) || trim($input['fecha_registro']) === "") $campos_faltantes[] = 'fecha_registro';
if (!isset($input['fecha_entrega']) || trim($input['fecha_entrega']) === "") $campos_faltantes[] = 'fecha_entrega';
if (!isset($input['producto']) || trim($input['producto']) === "") $campos_faltantes[] = 'producto';

if (!empty($campos_faltantes)) {
    echo json_encode(['success' => false, 'error' => 'Campos faltantes o vacíos: ' . implode(", ", $campos_faltantes)]);
    exit;
}

$cliente = $input['cliente'];
$cantidad = $input['cantidad'];
$fechaRegistro = $input['fecha_registro'];
$fechaEntrega = $input['fecha_entrega'];
$idfic = $input['producto'];

$stmt_ficha = mysqli_prepare($conn, "SELECT nombre FROM FichaTec WHERE idfic = ?");
if (!$stmt_ficha) {
    echo json_encode(["success" => false, "error" => "Error preparando consulta a FichaTec: " . mysqli_error($conn)]);
    exit;
}

mysqli_stmt_bind_param($stmt_ficha, "i", $idfic);
mysqli_stmt_execute($stmt_ficha);
mysqli_stmt_bind_result($stmt_ficha, $pro_nombre);
mysqli_stmt_fetch($stmt_ficha);
mysqli_stmt_close($stmt_ficha);

if (!$pro_nombre) {
    echo json_encode(["success" => false, "error" => "Producto no encontrado con idfic=$idfic"]);
    exit;
}

$estado = "Confirmado";
$stmt = mysqli_prepare($conn, "INSERT INTO Pedidos (nombrecliente, cantidad, estado, fecha_registro, fecha_entrega, pro_nombre) VALUES (?, ?, ?, ?, ?, ?)");
if (!$stmt) {
    echo json_encode(["success" => false, "error" => "Error preparando INSERT: " . mysqli_error($conn)]);
    exit;
}

mysqli_stmt_bind_param($stmt, "sissss", $cliente, $cantidad, $estado, $fechaRegistro, $fechaEntrega, $pro_nombre);

if (mysqli_stmt_execute($stmt)) {
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["success" => false, "error" => mysqli_error($conn)]);
}

mysqli_stmt_close($stmt);
?>