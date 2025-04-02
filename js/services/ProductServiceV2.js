import { Product } from '../models/Product.js';

class ProductService {
  constructor() {
    this.products = [];
    this.cartItems = [];
  }

  // ========== PRODUCT ARRAY OPERATIONS ==========
  
  async loadProducts() {
    try {
      const response = await fetch('/api/products');
      const productsData = await response.json();
      
      // Transform to Product objects
      this.products = productsData.map(p => new Product(
        p.id, 
        p.name,
        p.price,
        p.description,
        p.image
      ));
      
      return this.products;
    } catch (error) {
      console.error('Failed to load products:', error);
      return [];
    }
  }

  // Filter products by price range
  filterByPrice(min, max) {
    return this.products.filter(
      product => product.price >= min && product.price <= max
    );
  }

  // Search products by name/description
  searchProducts(keyword) {
    const term = keyword.toLowerCase();
    return this.products.filter(product => 
      product.name.toLowerCase().includes(term) || 
      product.description.toLowerCase().includes(term)
    );
  }

  // Sort products
  sortProducts(field = 'name', order = 'asc') {
    return [...this.products].sort((a, b) => {
      const valA = a[field];
      const valB = b[field];
      return order === 'asc' ? 
        valA > valB ? 1 : -1 : 
        valA < valB ? 1 : -1;
    });
  }

  // Get product by ID
  getProduct(id) {
    return this.products.find(p => p.id === id);
  }

  // ========== CART ARRAY OPERATIONS ==========
  
  addToCart(productId, quantity = 1) {
    const existing = this.cartItems.find(item => item.productId === productId);
    
    if (existing) {
      existing.quantity += quantity;
    } else {
      this.cartItems.push({
        productId,
        quantity,
        addedAt: new Date()
      });
    }
    
    return this.cartItems;
  }

  removeFromCart(productId) {
    this.cartItems = this.cartItems.filter(item => item.productId !== productId);
    return this.cartItems;
  }

  getCartItems() {
    // Map cart items to full product details
    return this.cartItems.map(item => ({
      ...item,
      product: this.getProduct(item.productId)
    }));
  }

  getCartTotal() {
    return this.getCartItems().reduce(
      (total, item) => total + (item.product.price * item.quantity),
      0
    );
  }
}

export const productService = new ProductService();