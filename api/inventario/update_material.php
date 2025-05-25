<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Manejar preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../conexion.php';

// Obtener datos JSON del cuerpo de la solicitud
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Datos JSON inválidos']);
    exit;
}

$accion = $input['accion'] ?? null;

if (!$accion) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Acción no especificada']);
    exit;
}

try {
    switch ($accion) {
        case 'agregar':
            // Validar campos requeridos
            $required_fields = ['Material', 'cantidad_disp', 'cantidad_min', 'estado'];
            foreach ($required_fields as $field) {
                if (!isset($input[$field]) || trim($input[$field]) === '') {
                    throw new Exception("Campo requerido faltante: $field");
                }
            }

            $material = trim($input['Material']);
            $cantidad_disp = (int)$input['cantidad_disp'];
            $cantidad_min = (int)$input['cantidad_min'];
            $estado = trim($input['estado']);
            $ord_idord = isset($input['ord_idord']) ? (int)$input['ord_idord'] : null;

            $sql = "INSERT INTO Inventario (Material, cantidad_disp, cantidad_min, estado, ord_idord) VALUES (?, ?, ?, ?, ?)";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("siisi", $material, $cantidad_disp, $cantidad_min, $estado, $ord_idord);
            
            if ($stmt->execute()) {
                echo json_encode(['success' => true, 'message' => 'Material agregado correctamente']);
            } else {
                throw new Exception("Error al insertar: " . $stmt->error);
            }
            break;

        case 'editar':
            // Validar campos requeridos
            $required_fields = ['id', 'Material', 'cantidad_disp', 'cantidad_min', 'estado'];
            foreach ($required_fields as $field) {
                if (!isset($input[$field]) || trim($input[$field]) === '') {
                    throw new Exception("Campo requerido faltante: $field");
                }
            }

            $id = (int)$input['id'];
            $material = trim($input['Material']);
            $cantidad_disp = (int)$input['cantidad_disp'];
            $cantidad_min = (int)$input['cantidad_min'];
            $estado = trim($input['estado']);
            $ord_idord = isset($input['ord_idord']) ? (int)$input['ord_idord'] : null;

            $sql = "UPDATE Inventario SET Material = ?, cantidad_disp = ?, cantidad_min = ?, estado = ?, ord_idord = ? WHERE id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("siisii", $material, $cantidad_disp, $cantidad_min, $estado, $ord_idord, $id);
            
            if ($stmt->execute()) {
                if ($stmt->affected_rows > 0) {
                    echo json_encode(['success' => true, 'message' => 'Material actualizado correctamente']);
                } else {
                    echo json_encode(['success' => false, 'error' => 'No se encontró el material o no hubo cambios']);
                }
            } else {
                throw new Exception("Error al actualizar: " . $stmt->error);
            }
            break;

        case 'eliminar':
            if (!isset($input['id'])) {
                throw new Exception("ID requerido para eliminar");
            }

            $id = (int)$input['id'];
            
            $sql = "DELETE FROM Inventario WHERE id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $id);
            
            if ($stmt->execute()) {
                if ($stmt->affected_rows > 0) {
                    echo json_encode(['success' => true, 'message' => 'Material eliminado correctamente']);
                } else {
                    echo json_encode(['success' => false, 'error' => 'No se encontró el material']);
                }
            } else {
                throw new Exception("Error al eliminar: " . $stmt->error);
            }
            break;

        default:
            throw new Exception("Acción no válida: $accion");
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

$conn->close();
?>