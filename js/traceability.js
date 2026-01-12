/**
 * ============================================================================
 * TRACEABILITY PAGE - Dynamic Batch Display
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {

    // Get batch ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const batchId = urlParams.get('batchId');

    // Get batch data from localStorage or use mock data
    let batch = null;
    const storedBatch = localStorage.getItem('currentBatch');

    if (storedBatch) {
        batch = JSON.parse(storedBatch);
    } else if (batchId) {
        // Try to get from myBatches in sessionStorage
        const batches = JSON.parse(sessionStorage.getItem('myBatches') || '[]');
        batch = batches.find(b => b.batchId === batchId);
    }

    // Default mock batch if none found
    if (!batch) {
        batch = {
            batchId: 'BATCH-2619283-001',
            batchName: 'PADDY Batch 1',
            cropName: 'PADDY',
            cropVariety: 'BPT-5204',
            procurementDate: '2026-01-05',
            aggregatorName: 'Green Earth Aggregators',
            farmerSources: [
                { farmerId: '103220624555172847', quantity: 100.0, consent: true },
                { farmerId: '103220624555311824', quantity: 150.0, consent: true }
            ]
        };
    }

    // Mock farmer data (matching the real farmer IDs)
    const MOCK_FARMERS = {
        '103220624555172847': { name: 'Nirmala Nara', mandal: 'CHANDRAGIRI', village: 'SESHA PURAM', crop: 'PADDY', acreage: 1.0, category: 'S2S' },
        '103220624555311824': { name: 'K.Ellama Konamgi', mandal: 'CHANDRAGIRI', village: 'SESHA PURAM', crop: 'PADDY', acreage: 1.0, category: 'S2S' },
        '103220624560122311': { name: 'K.Gangulamma Konamgi', mandal: 'CHANDRAGIRI', village: 'SESHA PURAM', crop: 'MANGO', acreage: 1.0, category: 'S2S' },
        '103220624570476915': { name: 'Bobba Chaitanya', mandal: 'CHANDRAGIRI', village: 'BHEEMAVARAM', crop: 'PADDY', acreage: 2.0, category: 'S2S' },
        '103220624572978160': { name: 'Indravathi Palem', mandal: 'CHANDRAGIRI', village: 'SESHA PURAM', crop: 'PADDY', acreage: 1.15, category: 'S2SW' }
    };

    // --- Populate Page ---

    // Title
    const titleEl = document.querySelector('.product-title h1');
    const batchIdEl = document.querySelector('.product-title p span');
    if (titleEl) titleEl.textContent = batch.cropName + ' - ' + (batch.batchName || 'Batch');
    if (batchIdEl) batchIdEl.textContent = batch.batchId;

    // Batch Info Grid
    const detailItems = document.querySelectorAll('.detail-item');
    const totalQuantity = batch.farmerSources.reduce((sum, f) => sum + (f.quantity || 0), 0);

    const infoMap = [
        batch.aggregatorName || 'Green Earth Aggregators',
        localStorage.getItem('user_id') || 'AGG-2619283',
        batch.cropName,
        batch.cropVariety,
        'Kharif',  // Default season
        '2025-26', // Default period
        batch.procurementDate,
        batch.expiryDate || 'N/A',
        totalQuantity.toFixed(2) + ' kgs',
        totalQuantity.toFixed(2) + ' kgs'
    ];

    detailItems.forEach((item, i) => {
        const span = item.querySelector('span');
        if (span && infoMap[i]) span.textContent = infoMap[i];
    });

    // Timeline - update aggregator name
    const timelineAgg = document.querySelector('.timeline-content strong');
    if (timelineAgg) timelineAgg.textContent = batch.aggregatorName || 'Green Earth Aggregators';

    // --- Farmer Table ---
    const farmerTbody = document.querySelector('#farmerDetailsSection tbody');
    if (farmerTbody && batch.farmerSources) {
        farmerTbody.innerHTML = ''; // Clear existing rows

        batch.farmerSources.forEach(source => {
            const farmer = MOCK_FARMERS[source.farmerId] || {
                name: 'Farmer ' + source.farmerId.slice(-6),
                mandal: 'Unknown',
                village: 'Unknown',
                crop: batch.cropName,
                acreage: 1.0,
                category: 'S2S'
            };

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${farmer.name}</td>
                <td>${farmer.mandal}</td>
                <td>${farmer.village}</td>
                <td>${farmer.crop}</td>
                <td>${farmer.acreage}</td>
                <td><span class="tag tag-practice">100% Chemical Free</span></td>
                <td><span class="tag tag-category">${farmer.category}</span></td>
                <td><a href="#" class="btn btn-small btn-primary"><i class="fa-solid fa-download"></i> Download</a></td>
            `;
            farmerTbody.appendChild(tr);
        });
    }

    // --- Leaflet Map Initialization ---
    try {
        var map = L.map('map').setView([13.63, 79.42], 11); // TIRUPATI coordinates

        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
            subdomains: 'abcd',
            maxZoom: 20
        }).addTo(map);

        var farmerPin = {
            radius: 6,
            fillColor: "#0078ff",
            color: "#ffffff",
            weight: 2,
            opacity: 1,
            fillOpacity: 0.9
        };

        var regionPin = {
            radius: 8,
            fillColor: "#e67e22",
            color: "#ffffff",
            weight: 2,
            opacity: 1,
            fillOpacity: 0.9
        };

        L.circleMarker([13.63, 79.42], regionPin).addTo(map)
            .bindPopup('<strong>Tirupati, CHANDRAGIRI</strong><br>Sourcing Region')
            .openPopup();

        L.circleMarker([13.64, 79.41], farmerPin).addTo(map)
            .bindPopup('Farmer: Nirmala Nara');
        L.circleMarker([13.62, 79.43], farmerPin).addTo(map)
            .bindPopup('Farmer: K.Ellama Konamgi');

    } catch (e) {
        console.error("Map initialization failed: ", e);
    }

    // --- Smooth Scroll ---
    try {
        const viewFarmersBtn = document.getElementById('viewFarmersBtn');
        const farmerSection = document.getElementById('farmerDetailsSection');

        if (viewFarmersBtn && farmerSection) {
            viewFarmersBtn.addEventListener('click', (e) => {
                e.preventDefault();
                farmerSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        }
    } catch (e) {
        console.error("Scroll script failed: ", e);
    }

});
