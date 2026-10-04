const API_URL = 'http://localhost:8081/api';

function showLoading() {
    const spinner = document.getElementById('loading');
    if (spinner) spinner.style.display = 'flex';
}

function hideLoading() {
    const spinner = document.getElementById('loading');
    if (spinner) spinner.style.display = 'none';
}

function showAlert(elementId, message, type) {
    const alertDiv = document.getElementById(elementId);
    if (alertDiv) {
        alertDiv.innerHTML = `<div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>`;
        setTimeout(() => alertDiv.innerHTML = '', 3000);
    }
}

function showLogin() {
    closeModals();
    document.getElementById('loginModal').style.display = 'block';
}

function showRegister() {
    closeModals();
    document.getElementById('registerModal').style.display = 'block';
}

function closeModals() {
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');
    if (loginModal) loginModal.style.display = 'none';
    if (registerModal) registerModal.style.display = 'none';
}

// Login Form
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        showLoading();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (response.ok && data.token) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('userName', data.name || email.split('@')[0]);
                localStorage.setItem('userEmail', data.email || email);
                localStorage.setItem('userRole', data.role || 'FARMER');
                showAlert('loginAlert', 'Login successful! Redirecting...', 'success');
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
            } else {
                showAlert('loginAlert', data.message || 'Invalid credentials', 'danger');
            }
        } catch (error) {
            showAlert('loginAlert', 'Backend not running on port 8080', 'danger');
        } finally {
            hideLoading();
        }
    });
}

// Register Form
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        showLoading();
        
        const userData = {
            name: document.getElementById('regName').value,
            email: document.getElementById('regEmail').value,
            password: document.getElementById('regPassword').value,
            phoneNumber: document.getElementById('regPhone').value,
            farmLocation: document.getElementById('regLocation').value,
            farmSize: parseFloat(document.getElementById('regSize').value) || 0
        };
        
        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
            
            const data = await response.json();
            
            if (response.ok && data.success) {
                showAlert('registerAlert', 'Registration successful! Please login.', 'success');
                setTimeout(() => {
                    closeModals();
                    showLogin();
                    registerForm.reset();
                }, 2000);
            } else {
                showAlert('registerAlert', data.message || 'Registration failed', 'danger');
            }
        } catch (error) {
            showAlert('registerAlert', 'Backend not running', 'danger');
        } finally {
            hideLoading();
        }
    });
}

// Close modal when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}