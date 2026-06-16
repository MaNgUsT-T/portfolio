<?php
// Datenbankkonfiguration
$host = "";
$user = "";
$pass = "";
$dbname = "";

// Verbindung herstellen
$mysqli = new mysqli($host, $user, $pass, $dbname);

// Fehlerbehandlung
if ($mysqli->connect_error) {
	die("Verbindung fehlgeschlagen: " . $mysqli->connect_error);
}
?>
