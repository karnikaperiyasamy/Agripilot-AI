requireAuth();

let expenseChart, categoryChart;

async function loadDashboard() {
    showLoading();
    try {
        const crops = await apiRequest('/farmer/crops');
        const expenses = await apiRequest('/farmer/expenses');
        
        const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
        const totalRevenue = crops.reduce((sum, c) => sum + ((c.expectedYield || 0) * (c.marketPrice || 2000)), 0);
        const totalProfit = totalRevenue - totalExpenses;
        
        document.getElementById('totalCrops').innerText = crops.length;
        document.getElementById('totalExpenses').innerText = '₹' + totalExpenses.toLocaleString();
        document.getElementById('totalIncome').innerText = '₹' + totalRevenue.toLocaleString();
        document.getElementById('totalProfit').innerText = '₹' + totalProfit.toLocaleString();
        
        createExpenseChart(expenses);
        createCategoryChart(expenses);
        displayRecentCrops(crops.slice(0, 5));
        
    } catch (error) {
        console.error('Error loading dashboard:', error);
    } finally {
        hideLoading();
    }
}

function createExpenseChart(expenses) {
    const ctx = document.getElementById('expenseChart').getContext('2d');
    const monthlyData = {};
    expenses.forEach(exp => {
        if (exp.expenseDate) {
            const date = new Date(exp.expenseDate);
            const monthYear = `${date.getMonth()+1}/${date.getFullYear()}`;
            monthlyData[monthYear] = (monthlyData[monthYear] || 0) + (exp.amount || 0);
        }
    });
    
    if (expenseChart) expenseChart.destroy();
    expenseChart = new Chart(ctx, {
        type: 'line',
        data: { labels: Object.keys(monthlyData), datasets: [{ label: 'Expenses (₹)', data: Object.values(monthlyData), borderColor: '#2ecc71', backgroundColor: 'rgba(46, 204, 113, 0.1)', tension: 0.4 }] },
        options: { responsive: true }
    });
}

function createCategoryChart(expenses) {
    const ctx = document.getElementById('categoryChart').getContext('2d');
    const categoryData = {};
    expenses.forEach(exp => { categoryData[exp.expenseType || 'Other'] = (categoryData[exp.expenseType || 'Other'] || 0) + (exp.amount || 0); });
    
    if (categoryChart) categoryChart.destroy();
    categoryChart = new Chart(ctx, {
        type: 'pie',
        data: { labels: Object.keys(categoryData), datasets: [{ data: Object.values(categoryData), backgroundColor: ['#2ecc71', '#3498db', '#e74c3c', '#f39c12', '#9b59b6'] }] }
    });
}

function displayRecentCrops(crops) {
    const tbody = document.getElementById('recentCrops');
    if (tbody) {
        tbody.innerHTML = crops.map(c => `<tr><td>${c.cropName}</td><td>${c.area}</td><td>${c.season}</td><td><span class="badge bg-success">${c.status || 'Active'}</span></td></tr>`).join('');
    }
}

loadDashboard();