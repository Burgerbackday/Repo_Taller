<?php
// api/tareas/get_tarea_operaria.php
header('Content-Type: application/json');
require_once '../../conexion.php';

$nombre = isset($_GET['nombre']) ? trim($_GET['nombre']) : '';
if ($nombre === '') {
  echo json_encode(['error' => 'Nombre no especificado']);
  exit;
}

$sql = "SELECT tarea_asignada AS tarea, descripcion, linea_produccion, pedido FROM Asig_Tareas WHERE nombre_operadora = ? ORDER BY fecha_asignacion DESC LIMIT 1";
$stmt = $conn->prepare($sql);
$stmt->bind_param('s', $nombre);
$stmt->execute();
$result = $stmt->get_result();

$response = [];
if ($row = $result->fetch_assoc()) {
  $response = $row;
} else {
  $response = ['tarea' => null, 'descripcion' => null, 'linea_produccion' => null, 'pedido' => null];
}

// También agregamos el historial en la misma respuesta
$sqlHistorial = "SELECT historial FROM Asig_Tareas WHERE nombre_operadora = ? ORDER BY fecha_asignacion DESC LIMIT 1";
$stmtHistorial = $conn->prepare($sqlHistorial);
$stmtHistorial->bind_param('s', $nombre);
$stmtHistorial->execute();
$resHistorial = $stmtHistorial->get_result();

$historial = [];
if ($rowH = $resHistorial->fetch_assoc()) {
  $lineas = explode("\n", $rowH['historial']);
  foreach ($lineas as $linea) {
    $partes = explode('|', $linea);
    if (count($partes) === 4) {
      $historial[] = [
        'tarea' => trim($partes[0]),
        'linea_produccion' => trim($partes[1]),
        'pedido' => trim($partes[2]),
        'fecha' => trim($partes[3])
      ];
    }
  }
}
$response['historial'] = $historial;

$stmt->close();
$stmtHistorial->close();
$conn->close();

echo json_encode($response);
?>
