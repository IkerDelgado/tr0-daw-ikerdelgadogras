<?php
$host = 'localhost'; // o la IP pública del servidor MySQL
$user = 'a23ikedelgra_a23ikedelgra';
$pass = 'InsPedralbes2025'; // pon aquí la contraseña que te hayan dado o la que hayas puesto
$dbname = 'a23ikedelgra_proyecte-tr0';

$conn = new mysqli($host, $user, $pass, $dbname);
if ($conn->connect_error) {
    die('Error de conexión: ' . $conn->connect_error);
}