<?php
// api/operadoras/asignar_tarea.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

require_once '../conexion.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        'success' => false,
        'error' => 'Método no permitido'
    ]);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    echo json_encode([
        'success' => false,
        'error' => 'Datos JSON inválidos'
    ]);
    exit;
}

$operador_id = isset($input['operador_id']) ? (int)$input['operador_id'] : 0;
$tarea = isset($input['tarea']) ? trim($input['tarea']) : '';
$descripcion = isset($input['descripcion']) ? trim($input['descripcion']) : '';
$linea_produccion = isset($input['linea_produccion']) ? trim($input['linea_produccion']) : 'Línea General';
$pedido = isset($input['pedido']) ? trim($input['pedido']) : '';
$prioridad = isset($input['prioridad']) ? trim($input['prioridad']) : 'media';
$meta_diaria = isset($input['meta_diaria']) ? (int)$input['meta_diaria'] : 50;

// Validar datos requeridos
if ($operador_id <= 0 || empty($tarea)) {
    echo json_encode([
        'success' => false,
        'error' => 'ID de operador y tarea son requeridos'
    ]);
    exit;
}

// Validar prioridad
$prioridades_validas = ['baja', 'media', 'alta', 'urgente'];
if (!in_array($prioridad, $prioridades_validas)) {
    $prioridad = 'media';
}

// Validar meta diaria
if ($meta_diaria <= 0 || $meta_diaria > 500) {
    $meta_diaria = 50;
}

try {
    $conn->begin_transaction();
    
    // Verificar que el operador existe y está disponible
    $sql_check = "SELECT id, nombre, estado, tarea_asignada FROM operador WHERE id = ?";
    $stmt_check = $conn->prepare($sql_check);
    $stmt_check->bind_param("i", $operador_id);
    $stmt_check->execute();
    $result_check = $stmt_check->get_result();
    
    if ($result_check->num_rows === 0) {
        throw new Exception('Operador no encontrado');
    }
    
    $operador = $result_check->fetch_assoc();
    
    // Verificar que no tenga tarea activa
    $sql_tarea_activa = "SELECT id FROM Asig_Tareas 
                        WHERE operador_id = ? 
                        AND estado IN ('asignada', 'en_proceso')";
    $stmt_tarea = $conn->prepare($sql_tarea_activa);
    $stmt_tarea->bind_param("i", $operador_id);
    $stmt_tarea->execute();
    
    if ($stmt_tarea->get_result()->num_rows > 0) {
        throw new Exception('La operadora ya tiene una tarea activa');
    }
    
    // Insertar nueva asignación de tarea
    $sql_insert = "INSERT INTO Asig_Tareas (
                       operador_id, 
                       nombre_operadora, 
                       tarea_asignada, 
                       descripcion, 
                       linea_produccion, 
                       pedido, 
                       estado,
                       prioridad, 
                       meta_diaria,
                       progreso_actual,
                       fecha_asignacion
                   ) VALUES (?, ?, ?, ?, ?, ?, 'asignada', ?, ?, 0, NOW())";
    
    $stmt_insert = $conn->prepare($sql_insert);
    $stmt_insert->bind_param("issssssi", 
        $operador_id, 
        $operador['nombre'], 
        $tarea, 
        $descripcion, 
        $linea_produccion, 
        $pedido, 
        $prioridad, 
        $meta_diaria
    );
    
    if (!$stmt_insert->execute()) {
        throw new Exception('Error al insertar asignación: ' . $stmt_insert->error);
    }
    
    $asignacion_id = $conn->insert_id;
    
    // Actualizar estado del operador
    $sql_update_op = "UPDATE operador 
                      SET tarea_asignada = ?, 
                          estado = 'ocupado',
                          updated_at = NOW()
                      WHERE id = ?";
    
    $stmt_update = $conn->prepare($sql_update_op);
    $stmt_update->bind_param("si", $tarea, $operador_id);
    
    if (!$stmt_update->execute()) {
        throw new Exception('Error al actualizar operador: ' . $stmt_update->error);
    }
    
    // Registrar en historial
    $historial_entry = date('Y-m-d H:i:s') . "|Asignada|Tarea: $tarea|Prioridad: $prioridad";
    $sql_historial = "UPDATE Asig_Tareas 
                     SET historial = CONCAT(COALESCE(historial, ''), ?, '\n')
                     WHERE id = ?";
    $stmt_historial = $conn->prepare($sql_historial);
    $stmt_historial->bind_param("si", $historial_entry, $asignacion_id);
    $stmt_historial->execute();
    
    // Crear notificación para la operadora (opcional)
    $sql_notif = "INSERT INTO notificaciones_operadora (operador_id, titulo, mensaje, tipo) 
                  VALUES (?, ?, ?, 'info')";
    
    $titulo_notif = "Nueva Tarea Asignada";
    $mensaje_notif = "Se te ha asignado una nueva tarea: $tarea. Línea: $linea_produccion. Meta diaria: $meta_diaria piezas.";
    
    $stmt_notif = $conn->prepare($sql_notif);
    $stmt_notif->bind_param("iss", $operador_id, $titulo_notif, $mensaje_notif);
    $stmt_notif->execute();
    
    $conn->commit();
    
    echo json_encode([
        'success' => true,
        'message' => "Tarea '$tarea' asignada correctamente a {$operador['nombre']}",
        'data' => [
            'asignacion_id' => $asignacion_id,
            'operador_id' => $operador_id,
            'operador_nombre' => $operador['nombre'],
            'tarea' => $tarea,
            'prioridad' => $prioridad,
            'meta_diaria' => $meta_diaria,
            'linea_produccion' => $linea_produccion,
            'pedido' => $pedido,
            'fecha_asignacion' => date('Y-m-d H:i:s')
        ]
    ]);
    
} catch (Exception $e) {
    $conn->rollback();
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}

$conn->close();
?>