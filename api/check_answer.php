<?php
// Comprueba si la respuesta enviada es correcta usando la base de datos
header('Content-Type: application/json');
require_once 'db.php';
$input = json_decode(file_get_contents('php://input'), true);
$id = isset($input['id']) ? intval($input['id']) : null;
$resposta = isset($input['resposta']) ? intval($input['resposta']) : null;
$result = ['correcta' => false];
if ($id && $resposta) {
    $stmt = $conn->prepare('SELECT correcta FROM respostes WHERE id = ? AND pregunta_id = ? LIMIT 1');
    $stmt->bind_param('ii', $resposta, $id);
    $stmt->execute();
    $stmt->bind_result($correcta);
    if ($stmt->fetch()) {
        if ($correcta == 1) {
            $result['correcta'] = true;
        }
    }
    $stmt->close();
}
echo json_encode($result);
