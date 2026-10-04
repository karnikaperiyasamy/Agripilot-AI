// API Configuration
// BUG FIX: this was 'http://localhost:8080' but the backend's context-path is
// '/api' (see application.properties: server.servlet.context-path=/api).
// Every request from expenses/profit/reports pages was hitting the wrong
// path and getting a 404/whitespace body.
const API_BASE_URL = 'http://localhost:8080/api';

async function apiRequest(endpoint, method = 'GET', data = null) {
    const url = `${API_BASE_URL}${endpoint}`;

    const token = localStorage.getItem('token');

    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    };

    // BUG FIX: the Authorization header was never sent, so even a logged-in
    // user's requests reached the backend as anonymous and every /farmer/**
    // endpoint replied "User not found".
    if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
    }

    if (data) {
        options.body = JSON.stringify(data);
    }

    // BUG FIX: a hung request (backend not running, or stuck on a DB error)
    // previously left the page waiting forever with no feedback - the modal
    // just sat there looking "stuck" with no error and no success. A 15s
    // timeout guarantees the user always gets a clear message.
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    options.signal = controller.signal;

    try {
        const response = await fetch(url, options);
        clearTimeout(timeoutId);

        // Get response as text first
        const text = await response.text();

        // Try to parse JSON
        let result;
        try {
            result = text ? JSON.parse(text) : {};
        } catch (e) {
            console.error('Failed to parse JSON:', text);
            throw new Error(`Server returned an unexpected response (HTTP ${response.status}). Is the backend running on http://localhost:8080?`);
        }

        if (response.status === 401) {
            // Token missing/expired - send the user back to login instead of
            // silently failing every request on the page.
            localStorage.removeItem('token');
            window.location.href = 'login.html';
            return;
        }

        if (!response.ok) {
            const errorMsg = result.error || result.message || `HTTP ${response.status}`;
            throw new Error(errorMsg);
        }

        return result;

    } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            console.error('API Request timed out:', url);
            throw new Error('Request timed out - please check that the backend is running (start.sh / start.bat) and try again.');
        }
        console.error('API Request failed:', error.message, url);
        throw error;
    }
}

// ================= EXPENSE SPECIFIC FUNCTIONS =================
async function getExpenses() {
    return await apiRequest('/farmer/expenses', 'GET');
}

async function addExpense(expenseData) {
    return await apiRequest('/farmer/expenses', 'POST', expenseData);
}

async function deleteExpense(id) {
    return await apiRequest(`/farmer/expenses/${id}`, 'DELETE');
}

// ================= AUTHENTICATION =================
// BUG FIX: this checked localStorage.getItem('user'), a key that is NEVER set
// anywhere in the app (login.html stores 'token'/'userName'/'userEmail'/
// 'userRole' instead). Every visit to expenses/profit/reports/schemes/
// ai-assistant/chatbot pages was instantly bounced back to login.html even
// right after a successful login.
function requireAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return null;
    }
    return {
        token: token,
        name: localStorage.getItem('userName'),
        email: localStorage.getItem('userEmail'),
        role: localStorage.getItem('userRole')
    };
}

function getToken() {
    return localStorage.getItem('token');
}

function logout() {
    localStorage.clear();
    window.location.href = 'index.html';
}

// Show the logged-in user's name in the top navbar, if present on the page
document.addEventListener('DOMContentLoaded', () => {
    const nameEl = document.getElementById('userName');
    if (nameEl) {
        const name = localStorage.getItem('userName');
        if (name) nameEl.innerHTML = `<i class="fas fa-user-circle"></i> Welcome, ${name}`;
    }
});
