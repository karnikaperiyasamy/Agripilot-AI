requireAuth();

async function loadSchemes() {
    showLoading();
    try {
        const schemes = await apiRequest('/schemes');
        displaySchemes(schemes);
    } catch (error) { console.error(error); } finally { hideLoading(); }
}

function displaySchemes(schemes) {
    const container = document.getElementById('schemesList');
    if (container) {
        container.innerHTML = schemes.map(scheme => `
            <div class="col-md-6 mb-4"><div class="scheme-card"><div class="scheme-icon"><i class="fas fa-hand-holding-usd"></i></div>
            <h4>${scheme.schemeName}</h4><p>${scheme.description || 'No description'}</p>
            <div class="scheme-details"><strong>Eligibility:</strong> ${scheme.eligibility || 'All farmers'}<br>
            <strong>Benefits:</strong> ${scheme.benefits || 'Financial assistance'}</div>
            <a href="${scheme.applyUrl || '#'}" target="_blank" class="btn btn-sm btn-success mt-3"><i class="fas fa-external-link-alt me-2"></i>Apply Now</a></div></div>
        `).join('');
    }
}

document.getElementById('searchScheme')?.addEventListener('input', async (e) => {
    const keyword = e.target.value;
    if (keyword.length > 2) {
        showLoading();
        try {
            const schemes = await apiRequest(`/schemes/search?keyword=${keyword}`);
            displaySchemes(schemes);
        } catch (error) { console.error(error); } finally { hideLoading(); }
    } else if (keyword.length === 0) { loadSchemes(); }
});

loadSchemes();