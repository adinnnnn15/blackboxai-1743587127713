document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    
    registerForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Validate passwords match
        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        try {
            // 1. Register user
            const registerResponse = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email, password })
            });

            if (!registerResponse.ok) {
                const error = await registerResponse.json();
                throw new Error(error.message || 'Registration failed');
            }

            // 2. Auto-login after registration
            const loginResponse = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }, 
                body: JSON.stringify({ email, password })
            });

            if (!loginResponse.ok) {
                throw new Error('Auto-login failed');
            }

            // 3. Store token and user data
            const { token, user } = await loginResponse.json();
            localStorage.setItem('authToken', token);
            localStorage.setItem('user', JSON.stringify(user));
            
            // 4. Redirect to profile page
            window.location.href = 'profile.html';
            
        } catch (error) {
            console.error('Registration error:', error);
            alert(error.message || 'Registration failed. Please try again.');
        }
    });
});