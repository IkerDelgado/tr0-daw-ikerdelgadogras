<?php
require_once 'db.php';
header('Content-Type: application/json');
$preguntas = [];
$sql = "SELECT * FROM preguntes";
$result = $conn->query($sql);
while ($row = $result->fetch_assoc()) {
    $row['respostes'] = [];
    $sql2 = "SELECT id, etiqueta, imatge, correcta FROM respostes WHERE pregunta_id = " . $row['id'];
    $result2 = $conn->query($sql2);
    while ($r = $result2->fetch_assoc()) {
        $row['respostes'][] = $r;
    }
    $preguntas[] = $row;
}
echo json_encode(['preguntes' => $preguntas]);
?>