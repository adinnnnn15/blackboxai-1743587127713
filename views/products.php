<?php
require_once 'partials/header.php';
require_once '../models/Product.php';

$productModel = new Product();
$products = $productModel->getAll();
?>

<div class="product-listing">
    <h1>Our Products</h1>
    <div class="products-grid">
        <?php foreach ($products as $product): ?>
        <div class="product-card">
            <img src="<?= htmlspecialchars($product['image']) ?>" alt="<?= htmlspecialchars($product['name']) ?>">
            <h3><?= htmlspecialchars($product['name']) ?></h3>
            <p class="price"><?= formatRupiah($product['price']) ?></p>
            <a href="product.php?id=<?= $product['id'] ?>" class="btn-view">View Details</a>
            <form action="cart.php" method="post">
                <input type="hidden" name="action" value="add">
                <input type="hidden" name="product_id" value="<?= $product['id'] ?>">
                <button type="submit" class="btn-add">Add to Cart</button>
            </form>
        </div>
        <?php endforeach; ?>
    </div>
</div>

<?php require_once 'partials/footer.php'; ?>