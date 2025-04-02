// Admin Product CRUD Operations
document.addEventListener('DOMContentLoaded', async () => {
    const productForm = document.getElementById('productForm');
    const productsTable = document.getElementById('productsTable');
    const saveBtn = document.getElementById('saveProduct');
    const cancelBtn = document.getElementById('cancelEdit');
    let editingId = null;

    // Load products on page load
    await loadProducts();

    // Form submission handler
    productForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const product = {
            name: document.getElementById('productName').value,
            price: parseFloat(document.getElementById('productPrice').value),
            description: document.getElementById('productDescription').value,
            image: document.getElementById('productImage').value
        };

        try {
            if (editingId) {
                await updateProduct(editingId, product);
            } else {
                await createProduct(product);
            }
            resetForm();
            await loadProducts();
        } catch (error) {
            console.error('Error saving product:', error);
            alert('Failed to save product');
        }
    });

    // Cancel edit handler
    cancelBtn.addEventListener('click', resetForm);

    // Load products from API
    async function loadProducts() {
        try {
            const response = await fetch('/api/products');
            const products = await response.json();
            renderProducts(products);
        } catch (error) {
            console.error('Error loading products:', error);
        }
    }

    // Render products table
    function renderProducts(products) {
        productsTable.innerHTML = products.map(product => `
            <tr>
                <td class="px-6 py-4 whitespace-nowrap">${product.name}</td>
                <td class="px-6 py-4 whitespace-nowrap">$${product.price.toFixed(2)}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <button onclick="editProduct('${product.id}')" class="text-blue-600 hover:text-blue-900 mr-2">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteProduct('${product.id}')" class="text-red-600 hover:text-red-900">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    // Create new product
    async function createProduct(product) {
        const response = await fetch('/api/products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(product)
        });
        return await response.json();
    }

    // Update existing product
    async function updateProduct(id, product) {
        const response = await fetch(`/api/products/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(product)
        });
        return await response.json();
    }

    // Delete product
    async function deleteProduct(id) {
        if (confirm('Are you sure you want to delete this product?')) {
            await fetch(`/api/products/${id}`, {
                method: 'DELETE'
            });
            await loadProducts();
        }
    }

    // Edit product
    window.editProduct = async function(id) {
        const response = await fetch(`/api/products/${id}`);
        const product = await response.json();
        
        document.getElementById('productId').value = product.id;
        document.getElementById('productName').value = product.name;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productDescription').value = product.description;
        document.getElementById('productImage').value = product.image;
        
        saveBtn.textContent = 'Update Product';
        cancelBtn.classList.remove('hidden');
        editingId = id;
    };

    // Reset form
    function resetForm() {
        productForm.reset();
        document.getElementById('productId').value = '';
        saveBtn.textContent = 'Add Product';
        cancelBtn.classList.add('hidden');
        editingId = null;
    }
});