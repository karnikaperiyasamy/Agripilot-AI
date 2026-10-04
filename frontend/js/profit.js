if (typeof requireAuth === "function") requireAuth();

let profitChart, revenueCostChart, profitTrendChart;

async function loadProfitData() {
    showLoading();
    try {
        const data = await apiRequest('/farmer/profit/calculate');
        displayProfitSummary(data);
        createProfitCharts(data.cropProfits || []);
        displayProfitDetails(data.cropProfits || []);
        loadProfitHistory();
    } catch (error) {
        console.error(error);
        alert('Failed to load profit data: ' + error.message);
    } finally { hideLoading(); }
}

function displayProfitSummary(data) {
    // BUG FIX: values could be undefined causing "₹undefined"; now guarded.
    document.getElementById('totalRevenue').innerText = '₹' + Number(data.totalRevenue || 0).toLocaleString();
    document.getElementById('totalCost').innerText = '₹' + Number(data.totalExpenses || 0).toLocaleString();
    document.getElementById('netProfit').innerText = '₹' + Number(data.totalProfit || 0).toLocaleString();
    const generalEl = document.getElementById('generalCost');
    if (generalEl) generalEl.innerText = '₹' + Number(data.generalExpenses || 0).toLocaleString();
}

function createProfitCharts(profitData) {
    const ctx1 = document.getElementById('profitChart').getContext('2d');
    if (profitChart) profitChart.destroy();
    profitChart = new Chart(ctx1, {
        type: 'bar',
        data: { labels: profitData.map(p => p.cropName), datasets: [{ label: 'Profit (₹)', data: profitData.map(p => p.netProfit || 0), backgroundColor: '#2ecc71' }] },
        options: { responsive: true, scales: { y: { beginAtZero: true } } }
    });

    const ctx2 = document.getElementById('revenueCostChart').getContext('2d');
    if (revenueCostChart) revenueCostChart.destroy();
    const totalRevenue = profitData.reduce((sum, p) => sum + Number(p.totalRevenue || 0), 0);
    const totalCost = profitData.reduce((sum, p) => sum + Number(p.totalExpense || 0), 0);
    revenueCostChart = new Chart(ctx2, {
        type: 'pie',
        data: { labels: ['Total Revenue', 'Total Cost'], datasets: [{ data: [totalRevenue, totalCost], backgroundColor: ['#2ecc71', '#e74c3c'] }] }
    });
}

function displayProfitDetails(profitData) {
    const tbody = document.getElementById('profitDetails');
    if (!tbody) return;
    if (!profitData.length) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center">No crops yet - add a crop to see profit analysis</td></tr>`;
        return;
    }
    tbody.innerHTML = profitData.map(p => `
        <tr><td>${p.cropName}</td><td>₹${Number(p.totalRevenue || 0).toLocaleString()}</td><td>₹${Number(p.totalExpense || 0).toLocaleString()}</td>
        <td class="${(p.netProfit || 0) >= 0 ? 'text-success' : 'text-danger'}">₹${Number(p.netProfit || 0).toLocaleString()}</td>
        <td>${typeof p.profitMargin === 'number' ? p.profitMargin.toFixed(2) : '0.00'}%</td>
        <td><small>${p.recommendation || 'Consider diversifying crops'}</small></td></tr>
    `).join('');
}

// EXTRA FEATURE: shows the trend of past profit calculations (previously the
// backend saved a Profit record every time but nothing ever displayed it)
async function loadProfitHistory() {
    try {
        const history = await apiRequest('/farmer/profit/history') || [];
        const canvas = document.getElementById('profitTrendChart');
        if (!canvas) return;

        const sorted = [...history].sort((a, b) => new Date(a.calculatedAt) - new Date(b.calculatedAt));
        const labels = sorted.map(h => new Date(h.calculatedAt).toLocaleDateString());
        const values = sorted.map(h => h.netProfit || 0);

        if (profitTrendChart) profitTrendChart.destroy();
        profitTrendChart = new Chart(canvas.getContext('2d'), {
            type: 'line',
            data: { labels, datasets: [{ label: 'Net Profit (₹)', data: values, borderColor: '#3498db', backgroundColor: 'rgba(52,152,219,0.1)', tension: 0.3, fill: true }] },
            options: { responsive: true, scales: { y: { beginAtZero: false } } }
        });
    } catch (error) {
        console.error('Failed to load profit history:', error);
    }
}

loadProfitData();
