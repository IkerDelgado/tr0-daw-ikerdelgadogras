<?php
require_once 'db.php';
header('Content-Type: application/json');
$input = json_decode(file_get_contents('php://input'), true);
$id = intval($input['id']);
$conn->query("DELETE FROM respostes WHERE pregunta_id=$id");
$conn->query("DELETE FROM preguntes WHERE id=$id");
echo json_encode(['success' => true]);
?>