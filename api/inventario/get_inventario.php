<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once '../conexion.php';

try {
    $sql = "SELECT id, Material, cantidad_disp, cantidad_min, estado, ord_idord FROM Inventario ORDER BY id ASC";
    $result = $conn->query($sql);

    if (!$result) {
        throw new Exception("Error en la consulta: " . $conn->error);
    }

    $inventario = [];
    while ($row = $result->fetch_assoc()) {
        $inventario[] = [
            'id' => (int)$row['id'],
            'Material' => $row['Material'],
            'cantidad_disp' => (int)$row['cantidad_disp'],
            'cantidad_min' => (int)$row['cantidad_min'],
            'estado' => $row['estado'],
            'ord_idord' => $row['ord_idord'] ? (int)$row['ord_idord'] : null
        ];
    }

    echo json_encode([
        'success' => true,
        'data' => $inventario
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}

$conn->close();
?>