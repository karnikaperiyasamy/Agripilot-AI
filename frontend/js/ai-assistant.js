requireAuth();

async function loadFarmingTips() {
    showLoading();
    try {
        const response = await apiRequest('/ai/farming-tips');
        displayTips(response.data || getDefaultTips(), 'farmingTips');
    } catch (error) { displayTips(getDefaultTips(), 'farmingTips'); } finally { hideLoading(); }
}

function getDefaultTips() {
    return "• Test soil before planting\n• Rotate crops for soil health\n• Use drip irrigation\n• Apply organic fertilizers\n• Monitor pests regularly";
}

function displayTips(tips, elementId) {
    const container = document.getElementById(elementId);
    if (container) {
        const tipsList = typeof tips === 'string' ? tips.split('\n') : [tips];
        container.innerHTML = tipsList.map(tip => `<div class="tip-item"><i class="fas fa-check-circle text-success me-2"></i>${tip}</div>`).join('');
    }
}

async function getCropSuggestions() {
    const soilType = document.getElementById('soilType')?.value;
    const season = document.getElementById('seasonSuggestion')?.value;
    showLoading();
    try {
        const response = await apiRequest(`/ai/recommend-crops?soilType=${soilType}&season=${season}&region=India`);
        const container = document.getElementById('cropSuggestions');
        if (container) {
            container.innerHTML = `<div class="alert alert-success mt-3"><strong>AI Recommendations:</strong><br>${response.data || 'Consider planting rice, wheat, or maize based on your conditions'}</div>`;
        }
    } catch (error) {
        document.getElementById('cropSuggestions').innerHTML = `<div class="alert alert-info">Based on your selection, consider rice for Kharif, wheat for Rabi, or maize for Summer season.</div>`;
    } finally { hideLoading(); }
}

async function loadProfitTips() {
    showLoading();
    try {
        const response = await apiRequest('/ai/profit-tips');
        displayTips(response.data || getDefaultProfitTips(), 'profitTips');
    } catch (error) { displayTips(getDefaultProfitTips(), 'profitTips'); } finally { hideLoading(); }
}

function getDefaultProfitTips() {
    return "• Buy inputs in bulk during off-season\n• Sell directly to consumers\n• Process your produce for value addition\n• Monitor market prices regularly\n• Reduce post-harvest losses";
}

window.loadFarmingTips = loadFarmingTips;
window.getCropSuggestions = getCropSuggestions;
window.loadProfitTips = loadProfitTips;

loadFarmingTips();
loadProfitTips();