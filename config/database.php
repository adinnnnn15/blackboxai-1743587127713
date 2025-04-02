<?php
define('DB_HOST', 'localhost');
define('DB_NAME', 'knitting_haven');
define('DB_USER', 'root');
define('DB_PASS', '');
define('BASE_URL', 'http://localhost:8000');

// Establish database connection
$db = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

if ($db->connect_error) {
    die("Connection failed: " . $db->connect_error);
}

function query($sql) {
    global $db;
    return $db->query($sql);
}

function escape($value) {
    global $db;
    return $db->real_escape_string($value);
}
?>