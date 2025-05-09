<?php
require_once '../conexion.php';

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['accion'])) {
    echo json_encode(['success' => false, 'error' => 'Acción no especificada']);
    exit;
}

$accion = $data['accion'];

try {
    if ($accion === 'agregar') {
        if (!isset($data['Material'], $data['cantidad_disp'], $data['cantidad_min'], $data['estado'])) {
            echo json_encode(['success' => false, 'error' => 'Datos incompletos para agregar']);
            exit;
        }

        $material = $data['Material'];
        $cantidad_disp = (int)$data['cantidad_disp'];
        $cantidad_min = (int)$data['cantidad_min'];
        $estado = $data['estado'];
        $ord_idord = isset($data['ord_idord']) ? (int)$data['ord_idord'] : null;

        $query = "INSERT INTO Inventario (Material, cantidad_disp, cantidad_min, estado, ord_idord) VALUES (?, ?, ?, ?, ?)";
        $stmt = $conn->prepare($query);
        if (!$stmt) {
            echo json_encode(['success' => false, 'error' => 'Error en la preparación de la consulta: ' . $conn->error]);
            exit;
        }
        $stmt->bind_param("siisi", $material, $cantidad_disp, $cantidad_min, $estado, $ord_idord);
        $stmt->execute();

        echo json_encode(['success' => true, 'message' => 'Material agregado correctamente']);

    } elseif ($accion === 'editar') {
        if (!isset($data['id'], $data['Material'], $data['cantidad_disp'], $data['cantidad_min'], $data['estado'])) {
            echo json_encode(['success' => false, 'error' => 'Datos incompletos para editar']);
            exit;
        }

        $id = (int)$data['id'];
        $material = $data['Material'];
        $cantidad_disp = (int)$data['cantidad_disp'];
        $cantidad_min = (int)$data['cantidad_min'];
        $estado = $data['estado'];
        $ord_idord = isset($data['ord_idord']) ? (int)$data['ord_idord'] : null;

        $query = "UPDATE Inventario SET Material = ?, cantidad_disp = ?, cantidad_min = ?, estado = ?, ord_idord = ? WHERE id = ?";
        $stmt = $conn->prepare($query);
        if (!$stmt) {
            echo json_encode(['success' => false, 'error' => 'Error en la preparación de la consulta: ' . $conn->error]);
            exit;
        }
        $stmt->bind_param("siisii", $material, $cantidad_disp, $cantidad_min, $estado, $ord_idord, $id);
        $stmt->execute();

        echo json_encode(['success' => true, 'message' => 'Material actualizado correctamente']);

    } elseif ($accion === 'eliminar') {
        if (!isset($data['id'])) {
            echo json_encode(['success' => false, 'error' => 'ID requerido para eliminar']);
            exit;
        }

        $id = (int)$data['id'];
        $query = "DELETE FROM Inventario WHERE id = ?";
        $stmt = $conn->prepare($query);
        if (!$stmt) {
            echo json_encode(['success' => false, 'error' => 'Error en la preparación de la consulta: ' . $conn->error]);
            exit;
        }
        $stmt->bind_param("i", $id);
        $stmt->execute();

        echo json_encode(['success' => true, 'message' => 'Material eliminado correctamente']);

    } else {
        echo json_encode(['success' => false, 'error' => 'Acción no válida']);
    }

} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>
