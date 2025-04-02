const API_BASE = 'http://localhost:3000/api';

export async function fetchProducts() {
  try {
    const response = await fetch(`${API_BASE}/products`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

export async function createProduct(productData) {
  try {
    const response = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(productData)
    });
    return await response.json();
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
}

export async function getCart(userId) {
  try {
    const response = await fetch(`${API_BASE}/cart/${userId}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching cart:', error);
    return [];
  }
}