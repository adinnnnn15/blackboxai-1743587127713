<?php
require_once '../models/Product.php';

if (!isAdmin()) {
    redirect('?page=login');
}

// Handle product creation
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    Product::create([
        'name' => $_POST['name'],
        'price' => $_POST['price'],
        'description' => $_POST['description'],
        'image' => $_POST['image']
    ]);
    redirect('?page=admin');
}

// Get all products for listing
$products = Product::getAll();
require '../views/admin/dashboard.php';
?>