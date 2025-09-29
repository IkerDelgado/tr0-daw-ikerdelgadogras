<?php
$host = 'localhost'; 
$user = 'a23ikedelgra_a23ikedelgra';
$pass = 'InsPedralbes2025';
$dbname = 'a23ikedelgra_proyecte-tr0';

$conn = new mysqli($host, $user, $pass, $dbname);
if ($conn->connect_error) {
    die('Error de conexión: ' . $conn->connect_error);
}