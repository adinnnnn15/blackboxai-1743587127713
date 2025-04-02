import { Product, DigitalProduct } from '../models/Product.js';

class ProductService {
  constructor() {
    this.products = [];
  }

  async loadProducts() {
    const response = await fetch('/api/products');
    if (!response.ok) throw new Error('Failed to load products');
    
    const productsData = await response.json();
    this.products = productsData.map(p => new Product(
      p.id,
      p.name,
      p.price,
      p.description,
      p.image
    ));
    return this.products;
  }

  async createProduct(productData) {
    const response = await fetch('/api/products', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify(productData)
    });

    if (!response.ok) throw new Error('Failed to create product');
    
    const newProduct = await response.json();
    return new Product(
      newProduct.id,
      newProduct.name,
      newProduct.price,
      newProduct.description,
      newProduct.image
    );
  }

  // Other CRUD methods...
}

export const productService = new ProductService();