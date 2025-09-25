<?php
$host = 'host.docker.internal'; // o la IP pública del servidor MySQL
$user = 'root';
$pass = ''; // pon aquí la contraseña que te hayan dado o la que hayas puesto
$dbname = 'a23ikedelgra_proyecte-tr0';

$conn = new mysqli($host, $user, $pass, $dbname);
if ($conn->connect_error) {
    die('Error de conexión: ' . $conn->connect_error);
}