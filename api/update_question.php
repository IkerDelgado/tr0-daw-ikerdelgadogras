<?php
require_once 'db.php';
header('Content-Type: application/json');
$input = json_decode(file_get_contents('php://input'), true);
$id = intval($input['id']);
$pregunta = $conn->real_escape_string($input['pregunta']);
$respuestas = $input['respostes'];
$sql = "UPDATE preguntes SET pregunta='$pregunta' WHERE id=$id";
$conn->query($sql);
// Borrar respuestas antiguas
$conn->query("DELETE FROM respostes WHERE pregunta_id=$id");
// Insertar nuevas respuestas
foreach ($respuestas as $r) {
    $etiqueta = $conn->real_escape_string($r['etiqueta']);
    $imatge = $conn->real_escape_string($r['imatge']);
    $correcta = $r['correcta'] ? 1 : 0;
    $sql2 = "INSERT INTO respostes (pregunta_id, etiqueta, imatge, correcta) VALUES ($id, '$etiqueta', '$imatge', $correcta)";
    $conn->query($sql2);
}
echo json_encode(['success' => true]);
?>