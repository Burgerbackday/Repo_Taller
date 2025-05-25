<?php
header('Content-Type: application/json');
require_once '../conexion.php';

$nombre = isset($_GET['nombre']) ? trim($_GET['nombre']) : '';

if (empty($nombre)) {
    echo json_encode(['success' => false, 'error' => 'Nombre no especificado']);
    exit;
}

try {
    $sql = "SELECT 
                a.id,
                a.tarea_asignada as tarea,
                a.descripcion,
                a.linea_produccion,
                a.pedido,
                a.fecha_asignacion,
                a.estado,
                a.prioridad,
                a.meta_diaria,
                a.progreso_actual,
                t.descripcion as tarea_descripcion_completa
            FROM Asig_Tareas a
            LEFT JOIN tareas t ON a.tarea_asignada = t.nombre
            LEFT JOIN operador o ON a.operador_id = o.id
            WHERE (a.nombre_operadora = ? OR o.nombre = ?)
            AND a.estado IN ('asignada', 'en_proceso')
            ORDER BY a.fecha_asignacion DESC 
            LIMIT 1";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('ss', $nombre, $nombre);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($row = $result->fetch_assoc()) {
        echo json_encode([
            'success' => true,
            'tarea' => $row['tarea'],
            'descripcion' => $row['tarea_descripcion_completa'] ?: $row['descripcion'],
            'linea_produccion' => $row['linea_produccion'] ?: 'Línea General',
            'pedido' => $row['pedido'],
            'estado' => $row['estado'] ?: 'asignada',
            'prioridad' => $row['prioridad'] ?: 'media',
            'meta_diaria' => (int)($row['meta_diaria'] ?: 100),
            'progreso_actual' => (int)($row['progreso_actual'] ?: 0),
        ]);
    } else {
        echo json_encode(['success' => true, 'tarea' => null]);
    }

} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>