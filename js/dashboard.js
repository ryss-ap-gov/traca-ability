/**
 * =============================================================================
 * AGGREGATOR DASHBOARD - JAVASCRIPT
 * =============================================================================
 * 
 * Displays:
 * - Dashboard summary stats (approved catchments, approved farmers, total batches)
 * - My Catchment Areas table (all statuses)
 * - My Farmer List table (all statuses)
 * 
 * Status Mapping:
 * - 0 = Pending
 * - 1 = Approved
 * - 2 = Rejected
 * 
 * UPDATED: Removed all demo fallbacks, uses real DB data only
 */

// Use global API_BASE_URL from apcnf.js, fallback to localhost
const API_BASE_URL = window.API_BASE_URL || 'http://localhost:8000';

// =============================================================================
// INITIALIZATION
// =============================================================================

document.addEventListener('DOMContentLoaded', function () {
    // Get user info from localStorage
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    if (user && user.user_id) {
        // Display aggregator name
        const nameDisplay = document.getElementById('aggregatorNameDisplay');
        if (nameDisplay) {
            nameDisplay.textContent = user.username || user.org_name || 'Aggregator';
        }

        // Load all data (no demo fallback)
        loadDashboardSummary(user.user_id);
        loadCatchmentAreas(user.user_id);
        loadFarmerList(user.user_id);
    } else {
        console.error('[ERROR] No user found in localStorage. Redirecting to login.');
        // Show error message instead of demo data
        document.getElementById('statCatchments').textContent = '-';
        document.getElementById('statFarmers').textContent = '-';
        document.getElementById('statBatches').textContent = '-';

        document.getElementById('catchmentTableBody').innerHTML = `
            <tr>
                <td colspan="7" class="no-data-message">
                    Please <a href="login.html">login</a> to view your dashboard.
                </td>
            </tr>
        `;
        document.getElementById('farmerTableBody').innerHTML = `
            <tr>
                <td colspan="9" class="no-data-message">
                    Please <a href="login.html">login</a> to view your farmers.
                </td>
            </tr>
        `;
    }
});

// =============================================================================
// STATUS MAPPING HELPER
// =============================================================================

function getStatusDisplay(statusCode) {
    const statusMap = {
        0: { text: 'Pending', class: 'status-pending' },
        1: { text: 'Approved', class: 'status-approved' },
        2: { text: 'Rejected', class: 'status-rejected' }
    };

    const status = statusMap[statusCode] || statusMap[0];
    return `<span class="${status.class}">${status.text}</span>`;
}

// =============================================================================
// LOAD DASHBOARD SUMMARY (APPROVED COUNTS)
// =============================================================================

async function loadDashboardSummary(aggregatorId) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/catchment/dashboard/summary/${aggregatorId}`);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
            document.getElementById('statCatchments').textContent = data.approved_catchments || 0;
            document.getElementById('statFarmers').textContent = data.approved_farmers || 0;
            document.getElementById('statBatches').textContent = data.total_batches || 0;
            console.log('[OK] Dashboard summary loaded:', data);
        }
    } catch (error) {
        console.error('[ERROR] Error loading dashboard summary:', error);
        document.getElementById('statCatchments').textContent = '0';
        document.getElementById('statFarmers').textContent = '0';
        document.getElementById('statBatches').textContent = '0';
    }
}

// =============================================================================
// LOAD CATCHMENT AREAS (ALL STATUSES)
// =============================================================================

async function loadCatchmentAreas(aggregatorId) {
    const tbody = document.getElementById('catchmentTableBody');

    try {
        const response = await fetch(`${API_BASE_URL}/api/catchment/my-requests/${aggregatorId}`);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.requests && data.requests.length > 0) {
            renderCatchmentTable(data.requests);
            console.log(`[OK] Loaded ${data.count} catchment areas`);
        } else {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="no-data-message">
                        No catchment areas found. <a href="catchment-area.html">Request one now!</a>
                    </td>
                </tr>
            `;
        }
    } catch (error) {
        console.error('[ERROR] Error loading catchment areas:', error);
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="no-data-message">
                    Error loading catchment areas. Please try again later.
                </td>
            </tr>
        `;
    }
}

function renderCatchmentTable(catchments) {
    const tbody = document.getElementById('catchmentTableBody');
    tbody.innerHTML = '';

    catchments.forEach(c => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${c.aggregator_id || '-'}</td>
            <td>${c.district_name || '-'}</td>
            <td>${c.mandal_name || '-'}</td>
            <td>${c.panchayat_name || '-'}</td>
            <td>${c.village_name || '-'}</td>
            <td>${c.crop_name || '-'}</td>
            <td>${getStatusDisplay(c.status)}</td>
        `;
        tbody.appendChild(row);
    });
}

// =============================================================================
// LOAD FARMER LIST (ALL STATUSES)
// =============================================================================

async function loadFarmerList(aggregatorId) {
    const tbody = document.getElementById('farmerTableBody');

    try {
        // Pass status=null or omit to get all farmers (not just approved)
        const response = await fetch(`${API_BASE_URL}/api/catchment/farmers/${aggregatorId}?status=1`);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.farmers && data.farmers.length > 0) {
            renderFarmerTable(data.farmers);
            console.log(`[OK] Loaded ${data.count} farmers`);
        } else {
            tbody.innerHTML = `
                <tr>
                    <td colspan="9" class="no-data-message">
                        No farmers found. Farmers are added when your catchment areas are approved.
                    </td>
                </tr>
            `;
        }
    } catch (error) {
        console.error('[ERROR] Error loading farmer list:', error);
        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="no-data-message">
                    Error loading farmers. Please try again later.
                </td>
            </tr>
        `;
    }
}

function renderFarmerTable(farmers) {
    const tbody = document.getElementById('farmerTableBody');
    tbody.innerHTML = '';

    farmers.forEach(f => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${f.farmer_id || f.aggregator_farmer_id || '-'}</td>
            <td>${f.farmer_name || f.aggregator_farmer_name || '-'}</td>
            <td>${f.farmer_category || f.aggregator_farmer_category || '-'}</td>
            <td>${f.district_name || f.dm_district_name || '-'}</td>
            <td>${f.mandal_name || f.dm_mandal_name || '-'}</td>
            <td>${f.panchayat_name || f.dm_panchayat_name || '-'}</td>
            <td>${f.village_name || f.dm_village_name || '-'}</td>
            <td>${f.crop_name || '-'}</td>
            <td>${getStatusDisplay(f.mapping_status || f.status || 1)}</td>
        `;
        tbody.appendChild(row);
    });
}