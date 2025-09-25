<?php
require_once 'db.php';
header('Content-Type: application/json');
$input = json_decode(file_get_contents('php://input'), true);
$pregunta = $conn->real_escape_string($input['pregunta']);
$respuestas = $input['respostes'];
// Validación: exactamente 4 respuestas y una marcada como correcta
if (count($respuestas) !== 4) {
    echo json_encode(['success' => false, 'error' => 'Debes poner exactamente 4 respuestas.']);
    exit;
}
$correctas = 0;
foreach ($respuestas as $r) {
    if (!empty($r['correcta'])) $correctas++;
}
if ($correctas !== 1) {
    echo json_encode(['success' => false, 'error' => 'Debes marcar una única respuesta como correcta.']);
    exit;
}
$sql = "INSERT INTO preguntes (pregunta) VALUES ('$pregunta')";
if ($conn->query($sql)) {
    $pregunta_id = $conn->insert_id;
    foreach ($respuestas as $r) {
        $etiqueta = $conn->real_escape_string($r['etiqueta']);
        $imatge = $conn->real_escape_string($r['imatge']);
        $correcta = $r['correcta'] ? 1 : 0;
        $sql2 = "INSERT INTO respostes (pregunta_id, etiqueta, imatge, correcta) VALUES ($pregunta_id, '$etiqueta', '$imatge', $correcta)";
        $conn->query($sql2);
    }
    echo json_encode(['success' => true, 'id' => $pregunta_id]);
} else {
    echo json_encode(['success' => false, 'error' => 'Error al crear la pregunta.']);
}
?>