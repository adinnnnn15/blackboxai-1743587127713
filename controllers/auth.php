<?php
require_once '../models/User.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = $_POST['email'];
    $password = $_POST['password'];
    
    $user = User::authenticate($email, $password);
    
    if ($user) {
        $_SESSION['user'] = $user;
        redirect('?page=profile');
    } else {
        $error = "Invalid email or password";
    }
}

require '../views/auth/login.php';
?>