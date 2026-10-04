let cropsForDropdown = [];

function cleanupModalBackdrops() {
    const anyOpen = document.querySelector('.modal.show');
    if (!anyOpen) {
        document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
        document.body.classList.remove('modal-open');
        document.body.style.removeProperty('overflow');
        document.body.style.removeProperty('padding-right');
    }
}

document.addEventListener("DOMContentLoaded", () => {
    cleanupModalBackdrops();

    if (typeof requireAuth === "function") requireAuth();

    loadCropsForDropdown();
    loadExpenses();

    const form = document.getElementById('addExpenseForm');
    if (form) form.addEventListener('submit', handleAddExpense);

    const editForm = document.getElementById('editExpenseForm');
    if (editForm) editForm.addEventListener('submit', handleEditExpense);
});

// ================= LOADING =================
function showLoading() {
    const loader = document.getElementById("loading");
    if (loader) loader.style.display = "flex";
}

function hideLoading() {
    const loader = document.getElementById("loading");
    if (loader) loader.style.display = "none";
}

// ================= CROPS DROPDOWN (extra feature) =================
async function loadCropsForDropdown() {
    try {
        cropsForDropdown = await apiRequest('/farmer/crops', 'GET') || [];
        const options = cropsForDropdown.map(c => `<option value="${c.id}">${c.cropName}</option>`).join('');
        const addSelect = document.getElementById('expenseCrop');
        const editSelect = document.getElementById('editExpenseCrop');
        if (addSelect) addSelect.innerHTML = `<option value="">General / Not crop-specific</option>${options}`;
        if (editSelect) editSelect.innerHTML = `<option value="">General / Not crop-specific</option>${options}`;
    } catch (error) {
        console.error("Failed to load crops for dropdown:", error);
    }
}

// ================= LOAD EXPENSES =================
async function loadExpenses() {
    try {
        showLoading();

        if (typeof apiRequest !== "function") {
            console.error("apiRequest not found in api.js");
            return;
        }

        const expenses = await apiRequest('/farmer/expenses', 'GET');

        displayExpenses(expenses || []);
        calculateTotals(expenses || []);
        loadCategoryBreakdown();

    } catch (error) {
        console.error("Load Error:", error);
        alert("Failed to load expenses: " + error.message);
    } finally {
        hideLoading();
    }
}

// ================= CATEGORY BREAKDOWN (extra feature) =================
async function loadCategoryBreakdown() {
    try {
        const summary = await apiRequest('/farmer/expenses/summary', 'GET');
        const container = document.getElementById('categoryBreakdown');
        if (!container || !summary || !summary.byCategory) return;
        const entries = Object.entries(summary.byCategory);
        if (!entries.length) {
            container.innerHTML = 'No expenses yet';
            return;
        }
        container.innerHTML = entries
            .sort((a, b) => b[1] - a[1])
            .map(([cat, amt]) => `<span class="badge bg-secondary me-1 mb-1">${cat}: ₹${Number(amt).toLocaleString()}</span>`)
            .join('');
    } catch (error) {
        console.error("Failed to load category breakdown:", error);
    }
}

// ================= DISPLAY =================
function displayExpenses(expenses) {
    const tbody = document.getElementById('expensesList');
    if (!tbody) return;

    if (!expenses.length) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center">No expenses found</td></tr>`;
        return;
    }

    tbody.innerHTML = expenses.map(exp => `
        <tr>
            <td>${exp.id}</td>
            <td>${exp.expenseType}</td>
            <td>₹${Number(exp.amount || 0).toLocaleString()}</td>
            <td>${exp.crop ? exp.crop.cropName : '<span class="text-muted">General</span>'}</td>
            <td>${exp.description || '-'}</td>
            <td>${exp.expenseDate ? new Date(exp.expenseDate).toLocaleDateString() : 'N/A'}</td>
            <td>
                <button class="btn btn-warning btn-sm me-1" onclick="openEditExpense(${exp.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger btn-sm" onclick="deleteExpense(${exp.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');

    // stash for the edit modal
    window.__expensesCache = expenses;
}

// ================= TOTALS =================
function calculateTotals(expenses) {
    const total = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    const avg = expenses.length ? total / expenses.length : 0;

    document.getElementById('totalExpensesAmount').innerText =
        '₹' + total.toLocaleString();

    document.getElementById('avgExpense').innerText =
        '₹' + avg.toLocaleString();
}

function showExpenseStatus(message, type) {
    const el = document.getElementById('expenseStatusMsg');
    if (!el) return;
    el.style.display = 'block';
    el.textContent = message;
    if (type === 'error') {
        el.style.background = '#f8d7da';
        el.style.color = '#842029';
    } else if (type === 'success') {
        el.style.background = '#d1e7dd';
        el.style.color = '#0f5132';
    } else {
        el.style.background = '#fff3cd';
        el.style.color = '#664d03';
    }
}

// ================= ADD EXPENSE =================
async function handleAddExpense(e) {
    e.preventDefault();
    showExpenseStatus('Button clicked - preparing request...', 'info');

    try {
        showLoading();

        if (typeof apiRequest !== "function") {
            showExpenseStatus('ERROR: apiRequest not found - js/api.js did not load. Check your internet connection or file paths.', 'error');
            return;
        }

        const cropEl = document.getElementById('expenseCrop');
        const dateEl = document.getElementById('expenseDate');
        const typeEl = document.getElementById('expenseType');
        const amountEl = document.getElementById('amount');
        const descEl = document.getElementById('description');

        // BUG FIX: reading these .value properties used to happen BEFORE the
        // try/catch even started. If any element was missing for any reason
        // (stale cached HTML, a typo, a browser extension interfering), that
        // threw an uncaught TypeError that the browser swallowed silently -
        // the button looked like it "did nothing" with zero feedback. Now
        // every read happens inside the try, and a missing element gives a
        // clear, specific alert instead of silent failure.
        if (!typeEl || !amountEl) {
            showExpenseStatus('ERROR: The Add Expense form did not load correctly. Hard-refresh the page (Ctrl+Shift+R) and try again.', 'error');
            return;
        }

        const cropId = cropEl ? cropEl.value : '';
        const dateVal = dateEl ? dateEl.value : '';

        const amountValue = amountEl.value;
        if (amountValue === '' || isNaN(Number(amountValue)) || Number(amountValue) <= 0) {
            showExpenseStatus('Please enter a valid amount greater than 0.', 'error');
            return;
        }

        const expenseData = {
            expenseType: typeEl.value,
            amount: Number(amountValue),
            description: descEl ? descEl.value : '',
            expenseDate: dateVal || new Date().toISOString().split('T')[0],
            crop: cropId ? { id: Number(cropId) } : null
        };

        showExpenseStatus('Sending expense to server (http://localhost:8080/api/farmer/expenses)...', 'info');

        await apiRequest('/farmer/expenses', 'POST', expenseData);

        showExpenseStatus('✅ Expense saved successfully!', 'success');

        const modalEl = document.getElementById('addExpenseModal');
        const modalInstance = bootstrap.Modal.getInstance(modalEl);

        await loadExpenses();

        setTimeout(() => {
            if (modalInstance) modalInstance.hide();
            e.target.reset();
            const statusEl = document.getElementById('expenseStatusMsg');
            if (statusEl) statusEl.style.display = 'none';
        }, 900);

    } catch (error) {
        // BUG FIX: previously if apiRequest threw, the modal just stayed open
        // with no visible feedback other than an alert - if the alert was
        // missed/dismissed, the page looked permanently "stuck" behind the
        // dark backdrop. We always surface the error clearly now, directly
        // on the page (not just an alert popup that's easy to miss/dismiss).
        console.error(error);
        showExpenseStatus('❌ FAILED: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

// Safety net: if something throws outside a try/catch (a real bug), don't
// leave the user staring at a frozen page with no explanation.
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled error:', event.reason);
    hideLoading();
});

window.addEventListener('error', (event) => {
    console.error('Uncaught error:', event.error || event.message);
    hideLoading();
});

// ================= EDIT (extra feature) =================
window.openEditExpense = function (id) {
    const exp = (window.__expensesCache || []).find(e => e.id === id);
    if (!exp) return;

    document.getElementById('editExpenseId').value = exp.id;
    document.getElementById('editExpenseType').value = exp.expenseType;
    document.getElementById('editAmount').value = exp.amount;
    document.getElementById('editExpenseCrop').value = exp.crop ? exp.crop.id : '';
    document.getElementById('editExpenseDate').value = exp.expenseDate || '';
    document.getElementById('editDescription').value = exp.description || '';

    new bootstrap.Modal(document.getElementById('editExpenseModal')).show();
};

async function handleEditExpense(e) {
    e.preventDefault();

    const id = document.getElementById('editExpenseId').value;
    const cropId = document.getElementById('editExpenseCrop').value;

    const expenseData = {
        expenseType: document.getElementById('editExpenseType').value,
        amount: Number(document.getElementById('editAmount').value),
        description: document.getElementById('editDescription').value,
        expenseDate: document.getElementById('editExpenseDate').value || null,
        crop: cropId ? { id: Number(cropId) } : null
    };

    try {
        showLoading();
        await apiRequest(`/farmer/expenses/${id}`, 'PUT', expenseData);

        const modalInstance = bootstrap.Modal.getInstance(document.getElementById('editExpenseModal'));
        if (modalInstance) modalInstance.hide();

        await loadExpenses();
        alert("Expense updated successfully");
    } catch (error) {
        console.error(error);
        alert("Failed to update expense: " + error.message);
    } finally {
        hideLoading();
    }
}

// ================= DELETE =================
window.deleteExpense = async function (id) {
    if (!confirm("Delete this expense?")) return;

    try {
        showLoading();

        await apiRequest(`/farmer/expenses/${id}`, 'DELETE');

        loadExpenses();

    } catch (error) {
        console.error(error);
        alert("Delete failed: " + error.message);
    } finally {
        hideLoading();
    }
};

// BUG FIX: this used to strip Bootstrap's own "modal-open" bookkeeping class
// from <body> the instant any modal opened. Bootstrap relies on that class
// to correctly remove the dark ".modal-backdrop" overlay when the modal is
// closed. Removing it early broke that cleanup, leaving an orphaned
// `<div class="modal-backdrop fade show">` stuck in the DOM permanently -
// which is exactly what dims the whole page and silently swallows clicks
// with no visible error. As a defensive safety net, if a backdrop is ever
// left behind after a modal fully closes, remove it manually.
document.addEventListener("hidden.bs.modal", function () {
    cleanupModalBackdrops();
});
