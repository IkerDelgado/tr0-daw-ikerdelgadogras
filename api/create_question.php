<?php
require_once 'db.php';
header('Content-Type: application/json');

// Debug: ver qué datos llegan
error_log('POST data: ' . print_r($_POST, true));
error_log('FILES data: ' . print_r($_FILES, true));

$pregunta = isset($_POST['pregunta']) ? $conn->real_escape_string($_POST['pregunta']) : '';
$respuestas = [];

for ($i = 0; $i < 4; $i++) {
    $etiqueta = isset($_POST["respostes"][$i]["etiqueta"]) ? $conn->real_escape_string($_POST["respostes"][$i]["etiqueta"]) : '';
    $correcta = isset($_POST["respostes"][$i]["correcta"]) ? intval($_POST["respostes"][$i]["correcta"]) : 0;
    
    $imatge = '';
    // Verificar si hay archivo para esta respuesta
    if (isset($_FILES["respostes"]["name"][$i]["imatge"]) && !empty($_FILES["respostes"]["name"][$i]["imatge"])) {
        $file = $_FILES["respostes"]["tmp_name"][$i]["imatge"];
        $filename = uniqid('img_') . '_' . basename($_FILES["respostes"]["name"][$i]["imatge"]);
        $target = __DIR__ . '/uploads/' . $filename;
        
        // Crear directorio si no existe
        if (!is_dir(__DIR__ . '/uploads/')) {
            mkdir(__DIR__ . '/uploads/', 0755, true);
        }
        
        if (move_uploaded_file($file, $target)) {
            $imatge = 'api/uploads/' . $filename;
        }
    }
    
    $respuestas[] = [
        'etiqueta' => $etiqueta,
        'correcta' => $correcta,
        'imatge' => $imatge
    ];
}

// Debug: ver respuestas procesadas
error_log('Respuestas procesadas: ' . print_r($respuestas, true));

// Validación: exactamente 4 respuestas y una marcada como correcta
if (count($respuestas) !== 4) {
    echo json_encode(['success' => false, 'error' => 'Debes poner exactamente 4 respuestas.']);
    exit;
}

$correctas = 0;
foreach ($respuestas as $r) {
    if ($r['correcta'] == 1) $correctas++;
}

// Debug: contar correctas
error_log('Número de respuestas correctas: ' . $correctas);

if ($correctas !== 1) {
    echo json_encode(['success' => false, 'error' => 'Debes marcar una única respuesta como correcta. Marcadas: ' . $correctas]);
    exit;
}

// Validar que todas las etiquetas estén completas
foreach ($respuestas as $r) {
    if (empty(trim($r['etiqueta']))) {
        echo json_encode(['success' => false, 'error' => 'Todas las respuestas deben tener etiqueta.']);
        exit;
    }
}

$sql = "INSERT INTO preguntes (pregunta) VALUES ('$pregunta')";
if ($conn->query($sql)) {
    $pregunta_id = $conn->insert_id;
    foreach ($respuestas as $r) {
        $etiqueta = $r['etiqueta'];
        $imatge = $r['imatge'];
        $correcta = $r['correcta'];
        $sql2 = "INSERT INTO respostes (pregunta_id, etiqueta, imatge, correcta) VALUES ($pregunta_id, '$etiqueta', '$imatge', $correcta)";
        $conn->query($sql2);
    }
    echo json_encode(['success' => true, 'id' => $pregunta_id]);
} else {
    $errorMsg = $conn->error;
    error_log('Error SQL: ' . $errorMsg);
    echo json_encode(['success' => false, 'error' => 'Error al crear la pregunta: ' . $errorMsg, 'sql' => $sql]);
}
?>