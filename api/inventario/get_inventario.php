<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// ... tu código PHP original sigue aquí
header('Content-Type: application/json');

// Include the database connection
include_once __DIR__ . '/../conexion.php';

$sql = "SELECT id, Material, cantidad_disp, cantidad_min, estado, ord_idord FROM Inventario";
$result = $conn->query($sql);

if ($result) {
    $inventario = [];
    while ($row = $result->fetch_assoc()) {
        $inventario[] = $row;
    }
    echo json_encode(['success' => true, 'data' => $inventario]);
} else {
    echo json_encode(['success' => false, 'error' => 'Error fetching inventory']);
}

// Close the connection
$conn->close();
?>
