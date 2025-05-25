<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Si es una petición OPTIONS, terminar aquí
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

// MODO DEBUG: Permitir GET para pruebas
$debug_mode = true;

try {
    // Información de debug
    $debug_info = array(
        "success" => false,
        "method" => $_SERVER['REQUEST_METHOD'],
        "timestamp" => date('Y-m-d H:i:s'),
        "debug_mode" => $debug_mode
    );

    // Si es GET y estamos en modo debug, mostrar información
    if ($_SERVER['REQUEST_METHOD'] == 'GET' && $debug_mode) {
        $debug_info["message"] = "API funcionando correctamente";
        $debug_info["note"] = "Para usar la API, envía una petición POST con los datos requeridos";
        $debug_info["required_fields"] = array(
            "id_material" => "ID del material a reabastecer",
            "cantidad" => "Cantidad a agregar",
            "fecha_reabastecimiento" => "Fecha del reabastecimiento (YYYY-MM-DD)",
            "proveedor" => "Nombre del proveedor",
            "costo_unitario" => "Costo por unidad"
        );
        echo json_encode($debug_info, JSON_PRETTY_PRINT);
        exit;
    }

    // Verificar método POST
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception("Este endpoint requiere método POST");
    }

    // Verificar datos requeridos
    $required_fields = array('id_material', 'cantidad', 'fecha_reabastecimiento', 'proveedor', 'costo_unitario');
    $missing_fields = array();
    
    foreach ($required_fields as $field) {
        if (!isset($_POST[$field]) || empty($_POST[$field])) {
            $missing_fields[] = $field;
        }
    }
    
    if (!empty($missing_fields)) {
        throw new Exception("Faltan campos requeridos: " . implode(', ', $missing_fields));
    }

    // Obtener datos del POST
    $id_material = intval($_POST['id_material']);
    $cantidad = floatval($_POST['cantidad']);
    $fecha_reabastecimiento = $_POST['fecha_reabastecimiento'];
    $proveedor = $_POST['proveedor'];
    $costo_unitario = floatval($_POST['costo_unitario']);

    // Validar datos
    if ($id_material <= 0) {
        throw new Exception("ID de material inválido");
    }
    if ($cantidad <= 0) {
        throw new Exception("La cantidad debe ser mayor a 0");
    }
    if ($costo_unitario < 0) {
        throw new Exception("El costo unitario no puede ser negativo");
    }

    // Aquí iría la conexión a la base de datos
    // Por ahora, simularemos una respuesta exitosa
    
    $debug_info["success"] = true;
    $debug_info["message"] = "Reabastecimiento registrado correctamente";
    $debug_info["data"] = array(
        "id_material" => $id_material,
        "cantidad" => $cantidad,
        "fecha_reabastecimiento" => $fecha_reabastecimiento,
        "proveedor" => $proveedor,
        "costo_unitario" => $costo_unitario,
        "costo_total" => $cantidad * $costo_unitario
    );

    echo json_encode($debug_info, JSON_PRETTY_PRINT);

} catch (Exception $e) {
    $debug_info["success"] = false;
    $debug_info["error"] = $e->getMessage();
    $debug_info["help"] = "Envía datos JSON con POST. Ejemplo: {\"accion\": \"obtener_criticos\"}";
    
    http_response_code(400);
    echo json_encode($debug_info, JSON_PRETTY_PRINT);
}
?>