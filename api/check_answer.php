<?php
// Comprueba si la respuesta enviada es correcta
header('Content-Type: application/json');
$json = file_get_contents(__DIR__ . '/../js/data.json');
$data = json_decode($json, true);
$input = json_decode(file_get_contents('php://input'), true);
$id = isset($input['id']) ? intval($input['id']) : null;
$resposta = isset($input['resposta']) ? intval($input['resposta']) : null;
$result = ['correcta' => false];
if ($id && $resposta) {
    foreach ($data['preguntes'] as $pregunta) {
        if ($pregunta['id'] === $id) {
            if ($pregunta['resposta_correcta'] === $resposta) {
                $result['correcta'] = true;
            }
            break;
        }
    }
}
echo json_encode($result);
