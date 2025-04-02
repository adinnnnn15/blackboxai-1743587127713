// Authentication module
const API_URL = 'http://localhost:3000';

// Login function
export async function login(email, password) {
    try {
        const response = await fetch(`${API_URL}/api/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            throw new Error('Login failed');
        }

        const { token, user } = await response.json();
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(user));
        return user;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
}

// Check authentication status
export function isAuthenticated() {
    return !!localStorage.getItem('authToken');
}

// Get current user
export function getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

// Logout function
export function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

// Initialize auth state
if (isAuthenticated() && window.location.pathname.endsWith('login.html')) {
    window.location.href = 'index.html';
}

// Handle login form submission
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
        await login(email, password);
        window.location.href = 'index.html';
    } catch (error) {
        alert('Login failed. Please check your credentials.');
    }
});