<?php
// Devuelve las preguntas sin la respuesta correcta
header('Content-Type: application/json');
$json = file_get_contents(__DIR__ . '/../js/data.json');
$data = json_decode($json, true);
foreach ($data['preguntes'] as &$pregunta) {
    unset($pregunta['resposta_correcta']);
}
echo json_encode($data);
