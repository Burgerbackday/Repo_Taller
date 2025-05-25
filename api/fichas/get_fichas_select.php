<?php
header('Content-Type: application/json');
require_once '../conexion.php';

$query = "SELECT idfic, nombre FROM FichaTec";
$result = mysqli_query($conn, $query);

$fichas = [];

if ($result) {
    while ($row = mysqli_fetch_assoc($result)) {
        $fichas[] = [
            'id' => $row['idfic'],
            'nombre' => $row['nombre']  // ← Aquí está el nombre del pantalón
        ];
    }
}

echo json_encode($fichas);
?>
