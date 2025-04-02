// Authentication functions
const API_URL = 'http://localhost:3000/api';

// Handle login form submission
document.getElementById('login-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        if (response.ok) {
            const { token } = await response.json();
            localStorage.setItem('authToken', token);
            window.location.href = 'index.html';
        } else {
            alert('Login failed. Please check your credentials.');
        }
    } catch (err) {
        console.error('Login error:', err);
        alert('An error occurred during login.');
    }
});

// Handle registration form submission
document.getElementById('register-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('reg-username').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    
    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })
        });
        
        if (response.ok) {
            alert('Registration successful! Please login.');
            window.location.href = 'login.html';
        } else {
            const error = await response.json();
            alert(`Registration failed: ${error.error}`);
        }
    } catch (err) {
        console.error('Registration error:', err);
        alert('An error occurred during registration.');
    }
});

// Check authentication status
export function isAuthenticated() {
    return !!localStorage.getItem('authToken');
}

// Get auth token
export function getAuthToken() {
    return localStorage.getItem('authToken');
}

// Logout function
export function logout() {
    localStorage.removeItem('authToken');
    window.location.href = 'login.html';
}