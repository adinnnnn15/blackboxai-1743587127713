import { formatRupiah } from '../utils/currencyFormatter.js';
import { productService } from './ProductServiceV2.js';

class CartService {
  constructor() {
    this.cart = JSON.parse(localStorage.getItem('cart')) || [];
  }

  // Add item to cart or increment quantity
  addItem(productId, quantity = 1) {
    const existing = this.cart.find(item => item.productId === productId);
    
    if (existing) {
      existing.quantity += quantity;
    } else {
      this.cart.push({
        productId,
        quantity,
        addedAt: new Date().toISOString()
      });
    }
    
    this._saveCart();
    return this.getCart();
  }

  // Update item quantity
  updateItem(productId, newQuantity) {
    const item = this.cart.find(item => item.productId === productId);
    if (item) {
      item.quantity = Math.max(1, newQuantity);
      this._saveCart();
    }
    return this.getCart();
  }

  // Remove item from cart
  removeItem(productId) {
    this.cart = this.cart.filter(item => item.productId !== productId);
    this._saveCart();
    return this.getCart();
  }

  // Get full cart with product details
  getCart() {
    return this.cart.map(item => {
      const product = productService.getProduct(item.productId);
      return {
        ...item,
        product,
        totalPrice: product.price * item.quantity,
        formattedPrice: formatRupiah(product.price),
        formattedTotal: formatRupiah(product.price * item.quantity)
      };
    });
  }

  // Get cart total
  getTotal() {
    return this.getCart().reduce(
      (sum, item) => sum + item.totalPrice, 
      0
    );
  }

  // Clear cart
  clear() {
    this.cart = [];
    this._saveCart();
  }

  // Save cart to localStorage
  _saveCart() {
    localStorage.setItem('cart', JSON.stringify(this.cart));
  }
}

export const cartService = new CartService();