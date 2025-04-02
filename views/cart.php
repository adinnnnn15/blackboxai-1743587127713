<?php include 'partials/header.php'; ?>

<div class="cart-container">
    <h2>Your Shopping Cart</h2>
    
    <?php if (empty($items)): ?>
        <p>Your cart is empty</p>
    <?php else: ?>
        <table class="cart-table">
            <thead>
                <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Total</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($items as $item): ?>
                <tr>
                    <td><?= htmlspecialchars($item['name']) ?></td>
                    <td><?= $item['formatted_price'] ?></td>
                    <td>
                        <form action="?action=cart&method=update" method="post" class="quantity-form">
                            <input type="hidden" name="product_id" value="<?= $item['id'] ?>">
                            <input type="number" name="quantity" value="<?= $item['quantity'] ?>" min="1">
                            <button type="submit" class="btn-update">Update</button>
                        </form>
                    </td>
                    <td><?= $item['formatted_total'] ?></td>
                    <td>
                        <form action="?action=cart&method=remove" method="post">
                            <input type="hidden" name="product_id" value="<?= $item['id'] ?>">
                            <button type="submit" class="btn-remove">Remove</button>
                        </form>
                    </td>
                </tr>
                <?php endforeach; ?>
            </tbody>
            <tfoot>
                <tr>
                    <td colspan="3" class="text-right"><strong>Total:</strong></td>
                    <td colspan="2"><?= formatRupiah($total) ?></td>
                </tr>
            </tfoot>
        </table>

        <div class="cart-actions">
            <a href="?action=products" class="btn-continue">Continue Shopping</a>
            <a href="?action=checkout" class="btn-checkout">Proceed to Checkout</a>
        </div>
    <?php endif; ?>
</div>

<?php include 'partials/footer.php'; ?>