// Profile Management System
document.addEventListener('DOMContentLoaded', async () => {
    // Form elements
    const profileForm = document.getElementById('profileForm');
    const editBtn = document.getElementById('editProfile');
    const saveBtn = document.getElementById('saveProfile');
    const cancelBtn = document.getElementById('cancelEdit');
    const inputs = profileForm.querySelectorAll('input:not([disabled]), textarea');
    
    // Load initial profile data
    await loadProfileData();
    
    // Enable edit mode
    editBtn.addEventListener('click', () => {
        inputs.forEach(input => input.disabled = false);
        editBtn.classList.add('hidden');
        saveBtn.classList.remove('hidden');
        cancelBtn.classList.remove('hidden');
    });
    
    // Cancel edit mode
    cancelBtn.addEventListener('click', () => {
        inputs.forEach(input => input.disabled = true);
        editBtn.classList.remove('hidden');
        saveBtn.classList.add('hidden');
        cancelBtn.classList.add('hidden');
        loadProfileData(); // Reset form
    });
    
    // Handle form submission
    profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveProfile();
    });
    
    // Load profile data from API
    async function loadProfileData() {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            if (!user) {
                window.location.href = 'login.html';
                return;
            }
            
            const response = await fetch(`/api/users/${user.id}`);
            if (!response.ok) throw new Error('Failed to load profile');
            
            const profile = await response.json();
            
            // Populate form fields
            document.getElementById('username').value = profile.username || '';
            document.getElementById('email').value = profile.email || '';
            document.getElementById('firstName').value = profile.firstName || '';
            document.getElementById('lastName').value = profile.lastName || '';
            document.getElementById('address').value = profile.address || '';
            
            if (profile.profileImage) {
                document.getElementById('profileImage').src = profile.profileImage;
            }
        } catch (error) {
            console.error('Error loading profile:', error);
            showAlert('Failed to load profile data', 'error');
        }
    }
    
    // Save profile data
    async function saveProfile() {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            if (!user) {
                window.location.href = 'login.html';
                return;
            }
            
            const profileData = {
                firstName: document.getElementById('firstName').value,
                lastName: document.getElementById('lastName').value,
                address: document.getElementById('address').value
            };
            
            const response = await fetch(`/api/users/${user.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify(profileData)
            });
            
            if (!response.ok) throw new Error('Failed to update profile');
            
            // Update UI
            inputs.forEach(input => input.disabled = true);
            editBtn.classList.remove('hidden');
            saveBtn.classList.add('hidden');
            cancelBtn.classList.add('hidden');
            
            showAlert('Profile updated successfully!', 'success');
        } catch (error) {
            console.error('Error saving profile:', error);
            showAlert('Failed to update profile', 'error');
        }
    }
    
    // Show alert message
    function showAlert(message, type) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `fixed top-4 right-4 px-4 py-2 rounded-md shadow-md ${
            type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`;
        alertDiv.textContent = message;
        document.body.appendChild(alertDiv);
        
        setTimeout(() => {
            alertDiv.remove();
        }, 3000);
    }
});