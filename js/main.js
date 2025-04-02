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

// Global state management
const appState = {
    user: null,
    cart: [],
    products: []
};

// Initialize all components
document.addEventListener('DOMContentLoaded', async function() {
    // Check authentication
    const token = localStorage.getItem('authToken');
    if (token) {
        try {
            const user = await verifyToken(token);
            appState.user = user;
            updateAuthUI();
        } catch (err) {
            localStorage.removeItem('authToken');
        }
    }

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
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    // Update all cart count indicators
    document.querySelectorAll('#cart-count, #mobile-cart-count').forEach(el => {
        el.textContent = count;
        el.style.display = count > 0 ? 'flex' : 'none';
    });

    // Update cart page if open
    if (window.location.pathname.includes('cart.html')) {
        renderCartItems();
    }
}

function renderCartItems() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartContainer = document.getElementById('cart-items');
    if (!cartContainer) return;

    cartContainer.innerHTML = '';
    let total = 0;

    cart.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (!product) return;

        total += product.price * item.quantity;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item flex justify-between items-center py-4 border-b';
        cartItem.innerHTML = `
            <div class="flex items-center">
                <img src="${product.image}" alt="${product.name}" class="w-20 h-20 object-cover rounded">
                <div class="ml-4">
                    <h3 class="font-medium">${product.name}</h3>
                    <p class="text-gray-500">$${product.price.toFixed(2)}</p>
                </div>
            </div>
            <div class="flex items-center">
                <div class="quantity-selector flex items-center border rounded">
                    <button class="decrease px-2">-</button>
                    <span class="quantity px-2">${item.quantity}</span>
                    <button class="increase px-2">+</button>
                </div>
                <button class="remove-item ml-4 text-red-500" data-id="${item.productId}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        cartContainer.appendChild(cartItem);
    });

    document.getElementById('cart-total').textContent = `$${total.toFixed(2)}`;
    setupCartItemEvents();
}

function initCart() {
    updateCartCount();
    setupCartItemEvents();
}

function setupCartItemEvents() {
    // Quantity buttons
    document.querySelectorAll('.quantity-selector button').forEach(btn => {
        btn.addEventListener('click', function() {
            const parent = this.closest('.cart-item');
            const productId = parseInt(parent.querySelector('.remove-item').getAttribute('data-id'));
            const quantityEl = parent.querySelector('.quantity');
            let quantity = parseInt(quantityEl.textContent);

            if (this.classList.contains('decrease') && quantity > 1) {
                quantity--;
            } else if (this.classList.contains('increase')) {
                quantity++;
            }

            quantityEl.textContent = quantity;
            updateCartItem(productId, quantity);
        });
    });

    // Remove buttons
    document.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            removeFromCart(productId);
        });
    });
}

async function updateCartItem(productId, quantity) {
    try {
        const response = await fetch(`${API_URL}/cart`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: 'current-user',
                productId,
                quantity
            })
        });
        
        if (response.ok) {
            updateCartCount();
        }
    } catch (err) {
        console.error('Error updating cart:', err);
    }
}

async function removeFromCart(productId) {
    try {
        const response = await fetch(`${API_URL}/cart`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: 'current-user',
                productId
            })
        });
        
        if (response.ok) {
            updateCartCount();
        }
    } catch (err) {
        console.error('Error removing from cart:', err);
    }
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
    const menuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
            // Toggle between hamburger and close icon
            const icon = this.querySelector('i');
            if (mobileMenu.classList.contains('hidden')) {
                icon.classList.replace('fa-times', 'fa-bars');
            } else {
                icon.classList.replace('fa-bars', 'fa-times');
            }
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!mobileMenu.contains(e.target) && e.target !== menuButton) {
                mobileMenu.classList.add('hidden');
                menuButton.querySelector('i').classList.replace('fa-times', 'fa-bars');
            }
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