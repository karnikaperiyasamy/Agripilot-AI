requireAuth();

let cropsData = [];

async function loadCrops() {
    showLoading();
    try {
        cropsData = await apiRequest('/farmer/crops');
        displayCrops(cropsData);
    } catch (error) { console.error(error); } finally { hideLoading(); }
}

function displayCrops(crops) {
    const tbody = document.getElementById('cropsList');
    if (tbody) {
        tbody.innerHTML = crops.map(crop => `
            <tr><td>${crop.id}</td><td>${crop.cropName}</td><td>${crop.area}</td><td>${crop.season}</td>
            <td>${crop.expectedYield || '-'}</td><td><span class="badge bg-success">${crop.status || 'Active'}</span></td>
            <td><button class="btn btn-sm btn-warning me-1" onclick="editCrop(${crop.id})"><i class="fas fa-edit"></i></button>
            <button class="btn btn-sm btn-danger" onclick="deleteCrop(${crop.id})"><i class="fas fa-trash"></i></button></td></tr>
        `).join('');
    }
}

document.getElementById('addCropForm')?.addEventListener('submit', async (e) => {
    e.preventDefault(); showLoading();
    const cropData = {
        cropName: document.getElementById('cropName').value,
        area: parseFloat(document.getElementById('area').value),
        season: document.getElementById('season').value,
        expectedYield: parseFloat(document.getElementById('expectedYield').value),
        marketPrice: parseFloat(document.getElementById('marketPrice').value),
        plantingDate: document.getElementById('plantingDate').value
    };
    try {
        await apiRequest('/farmer/crops', 'POST', cropData);
        bootstrap.Modal.getInstance(document.getElementById('addCropModal')).hide();
        document.getElementById('addCropForm').reset();
        loadCrops();
    } catch (error) { alert('Error adding crop'); } finally { hideLoading(); }
});

window.editCrop = async (id) => {
    const crop = cropsData.find(c => c.id === id);
    if (crop) {
        document.getElementById('editCropId').value = crop.id;
        document.getElementById('editCropName').value = crop.cropName;
        document.getElementById('editArea').value = crop.area;
        document.getElementById('editSeason').value = crop.season;
        document.getElementById('editExpectedYield').value = crop.expectedYield;
        document.getElementById('editMarketPrice').value = crop.marketPrice;
        document.getElementById('editPlantingDate').value = crop.plantingDate;
        new bootstrap.Modal(document.getElementById('editCropModal')).show();
    }
};

document.getElementById('editCropForm')?.addEventListener('submit', async (e) => {
    e.preventDefault(); showLoading();
    const id = document.getElementById('editCropId').value;
    const cropData = {
        cropName: document.getElementById('editCropName').value,
        area: parseFloat(document.getElementById('editArea').value),
        season: document.getElementById('editSeason').value,
        expectedYield: parseFloat(document.getElementById('editExpectedYield').value),
        marketPrice: parseFloat(document.getElementById('editMarketPrice').value),
        plantingDate: document.getElementById('editPlantingDate').value
    };
    try {
        await apiRequest(`/farmer/crops/${id}`, 'PUT', cropData);
        bootstrap.Modal.getInstance(document.getElementById('editCropModal')).hide();
        loadCrops();
    } catch (error) { alert('Error updating crop'); } finally { hideLoading(); }
});

window.deleteCrop = async (id) => {
    if (confirm('Delete this crop?')) {
        showLoading();
        try { await apiRequest(`/farmer/crops/${id}`, 'DELETE'); loadCrops(); } 
        catch (error) { alert('Error deleting crop'); } finally { hideLoading(); }
    }
};

loadCrops();