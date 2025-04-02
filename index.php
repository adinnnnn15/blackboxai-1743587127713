<?php
require_once 'config.php';
require_once 'models/Database.php';
require_once 'models/Product.php';
require_once 'models/User.php';
require_once 'controllers/ProductController.php';
require_once 'controllers/UserController.php';

// Handle routing
$action = $_GET['action'] ?? 'home';

switch ($action) {
    case 'products':
        $controller = new ProductController();
        $controller->index();
        break;
    case 'cart':
        require 'controllers/CartController.php';
        $controller = new CartController();
        $controller->index();
        break;
    case 'login':
        $controller = new UserController();
        $controller->login();
        break;
    default:
        require 'views/home.php';
}
?>