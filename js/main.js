// Main JavaScript for Knitting Haven e-commerce site

import { fetchProducts, createProduct, getCart } from './apiService.js';

let products = [];
let cart = [];

// Initialize with API data
async function initialize() {
  products = await fetchProducts();
  cart = await getCart('current-user'); // Replace with actual user ID
  updateUI();
}

// CRUD Operations
async function loadProducts() {
    const productsList = document.getElementById('products-list');
    if (!productsList) return;

    productsList.innerHTML = '';
    await fetchProducts();
    products.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">${product.name}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-500">$${product.price.toFixed(2)}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button onclick="editProduct(${product.id})" class="text-purple-400 hover:text-purple-600 mr-3">Edit</button>
                <button onclick="deleteProduct(${product.id})" class="text-red-400 hover:text-red-600">Delete</button>
            </td>
        `;
        productsList.appendChild(row);
    });
}

function setupForm() {
    const form = document.getElementById('product-form');
    if (!form) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const id = document.getElementById('product-id').value;
        const name = document.getElementById('product-name').value;
        const price = parseFloat(document.getElementById('product-price').value);
        const description = document.getElementById('product-description').value;
        const image = document.getElementById('product-image').value;

        if (id) {
            updateProduct(id, { name, price, description, image });
        } else {
            addProduct({ name, price, description, image });
        }

        form.reset();
        document.getElementById('cancel-edit').classList.add('hidden');
        document.getElementById('form-title').textContent = 'Add New Product';
    });

    const cancelBtn = document.getElementById('cancel-edit');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            document.getElementById('product-form').reset();
            document.getElementById('product-id').value = '';
            this.classList.add('hidden');
            document.getElementById('form-title').textContent = 'Add New Product';
        });
    }
}

function addProduct(product) {
    product.id = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
    products.push(product);
    loadProducts();
    saveToLocalStorage();
}

function editProduct(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    document.getElementById('product-id').value = product.id;
    document.getElementById('product-name').value = product.name;
    document.getElementById('product-price').value = product.price;
    document.getElementById('product-description').value = product.description;
    document.getElementById('product-image').value = product.image;

    document.getElementById('form-title').textContent = 'Edit Product';
    document.getElementById('cancel-edit').classList.remove('hidden');
}

async function updateProduct(id, updatedProduct) {
    try {
        const response = await fetch(`${API_URL}/products/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedProduct)
        });
        const result = await response.json();
        await fetchProducts();
        loadProducts();
        return result;
    } catch (err) {
        console.error('Error updating product:', err);
        throw err;
    }
}

async function deleteProduct(id) {
    if (confirm('Are you sure you want to delete this product?')) {
        try {
            const response = await fetch(`${API_URL}/products/${id}`, {
                method: 'DELETE'
            });
            await fetchProducts();
            loadProducts();
        } catch (err) {
            console.error('Error deleting product:', err);
        }
    }
}

function updateUI() {
    if (document.getElementById('products-list')) {
        loadProducts();
        setupForm();
    }
    if (document.getElementById('products-container')) {
        loadProductsForShop();
    }
    updateCartCount();
}

function loadFromLocalStorage() {
    const savedProducts = localStorage.getItem('knittingHavenProducts');
    if (savedProducts) {
        products = JSON.parse(savedProducts);
    }
}

function loadProductsForShop() {
    const container = document.getElementById('products-container');
    if (!container) return;

    container.innerHTML = '';
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition product-card';
        productCard.innerHTML = `
            <div class="h-48 bg-blue-100 flex items-center justify-center">
                <img src="${product.image}" alt="${product.name}" class="h-full w-full object-cover">
            </div>
            <div class="p-6">
                <h3 class="text-xl font-semibold text-gray-700 mb-2">${product.name}</h3>
                <p class="text-gray-500 mb-4">${product.description}</p>
                <div class="flex justify-between items-center">
                    <span class="text-lg font-bold text-purple-400">$${product.price.toFixed(2)}</span>
                    <button class="bg-pink-200 hover:bg-pink-300 text-pink-700 py-2 px-4 rounded-full transition add-to-cart" data-id="${product.id}">Add to Cart</button>
                </div>
            </div>
        `;
        container.appendChild(productCard);
    });

    // Add event listeners to cart buttons
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            addToCart(productId);
        });
    });
}

async function addToCart(productId) {
    try {
        const product = products.find(p => p.id == productId);
        if (!product) return;

        // Call API to add to cart
        const response = await fetch(`${API_URL}/cart`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: 'current-user',
                productId,
                quantity: 1
            })
        });
        
        if (response.ok) {
            updateCartCount();
        }
    } catch (error) {
        console.error('Error adding to cart:', error);
    }
}

// Import auth functions
import { isAuthenticated, logout } from './auth.js';

// Initialize
document.addEventListener('DOMContentLoaded', async function() {
    // Check authentication for protected pages
    if (!isAuthenticated() && window.location.pathname.includes('admin')) {
        window.location.href = 'login.html';
        return;
    }

    // Add logout button event listener
    document.getElementById('logout-btn')?.addEventListener('click', logout);

    await initialize();
    
    // Initialize appropriate functions based on current page
    if (document.getElementById('products-list')) {
        // Admin page functions
        loadProducts();
        setupForm();
    } else if (document.getElementById('products-container')) {
        // Shop page functions
        loadProductsForShop();
    } else {
        // Other pages
        initCart();
        initQuantitySelectors();
        initFormValidation();
        initMobileMenu();
    }

    // Initialize product galleries if present
    if (document.querySelector('.product-thumbnail')) {
        initProductGallery();
    }
});

function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.querySelectorAll('.cart-item-count').forEach(el => {
        el.textContent = count;
    });
}

function initCart() {
    updateCartCount();
    // Additional cart initialization if needed
}

function initQuantitySelectors() {
    // Quantity selector functionality
    document.querySelectorAll('.quantity-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const input = this.parentElement.querySelector('.quantity-input');
            let value = parseInt(input.value);
            
            if (this.classList.contains('decrease') && value > 1) {
                input.value = value - 1;
            } else if (this.classList.contains('increase')) {
                input.value = value + 1;
            }
            
            // Update cart total or perform other actions
            updateCartTotal();
        });
    });
}

function initFormValidation() {
    // Form validation would go here
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            // Validate form fields before submission
            let isValid = true;
            
            // Example validation for checkout form
            if (form.id === 'checkout-form') {
                const cardNumber = form.querySelector('#card-number');
                if (cardNumber && cardNumber.value.replace(/\s/g, '').length !== 16) {
                    isValid = false;
                    showError(cardNumber, 'Please enter a valid 16-digit card number');
                }
            }
            
            if (!isValid) {
                e.preventDefault();
            }
        });
    });
}

function initMobileMenu() {
    // Mobile menu toggle would go here
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            const menu = document.querySelector('.mobile-menu');
            menu.classList.toggle('hidden');
        });
    }
}

function updateCartTotal() {
    // Calculate and update cart total
    console.log('Cart total updated');
}

function showError(element, message) {
    // Display error message for form validation
    const errorElement = document.createElement('div');
    errorElement.className = 'text-red-500 text-sm mt-1';
    errorElement.textContent = message;
    
    // Remove any existing error
    const existingError = element.nextElementSibling;
    if (existingError && existingError.classList.contains('text-red-500')) {
        existingError.remove();
    }
    
    element.insertAdjacentElement('afterend', errorElement);
    element.classList.add('border-red-500');
}

// Product image gallery functionality
function initProductGallery() {
    const thumbnails = document.querySelectorAll('.product-thumbnail');
    const mainImage = document.querySelector('.product-main-image');
    
    if (thumbnails && mainImage) {
        thumbnails.forEach(thumbnail => {
            thumbnail.addEventListener('click', function() {
                // Update main image source
                const newSrc = this.getAttribute('data-full');
                mainImage.src = newSrc;
                
                // Update active thumbnail
                thumbnails.forEach(t => t.classList.remove('border-blue-400'));
                this.classList.add('border-blue-400');
            });
        });
    }
}

// Initialize any product galleries on the page
if (document.querySelector('.product-thumbnail')) {
    initProductGallery();
}