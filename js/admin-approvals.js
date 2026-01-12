/**
 * ============================================================================
 * ADMIN APPROVAL SYSTEM - WITH PROPER PAGINATION
 * ============================================================================
 * 
 * FEATURES:
 * - Load pending aggregators (status = 0)
 * - Load pending buyers (status = 0)
 * - Load application history (status IN (1, 2))
 * - Approve/Reject functionality
 * - Document viewing
 * - Dynamic count updates
 * - Real-time table updates
 * - Proper pagination (10 items per page)
 * 
 * ============================================================================
 */

// Define API_BASE_URL fallback
if (typeof window.API_BASE_URL === 'undefined') {
    window.API_BASE_URL = 'http://localhost:8000';
}

// ============================================================================
// PAGINATION STATE
// ============================================================================

const paginationState = {
    aggregators: {
        currentPage: 1,
        itemsPerPage: 10,
        totalItems: 0,
        allData: []  // Store all data
    },
    buyers: {
        currentPage: 1,
        itemsPerPage: 10,
        totalItems: 0,
        allData: []  // Store all data
    },
    history: {
        currentPage: 1,
        itemsPerPage: 10,
        totalItems: 0,
        allData: []  // Store all data
    }
};

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ Admin Approvals page loaded');
    
    // Load all data
    loadPendingAggregators();
    loadPendingBuyers();
    loadApplicationHistory();
});

// ============================================================================
// LOAD PENDING AGGREGATORS
// ============================================================================

async function loadPendingAggregators() {
    console.log('📋 Loading pending aggregators...');
    
    const tbody = document.getElementById('aggregatorTableBody');
    const countSpan = document.getElementById('pendingAggCount');
    
    try {
        const response = await fetch(`${window.API_BASE_URL}/admin/pending_aggregators`);
        const data = await response.json();
        
        console.log(`✅ Loaded ${data.count} pending aggregators`);
        
        // Store data in state
        paginationState.aggregators.allData = data.aggregators;
        paginationState.aggregators.totalItems = data.count;
        
        // Update count
        countSpan.textContent = data.count;
        
        // Clear table
        tbody.innerHTML = '';
        
        if (data.count === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="placeholder">
                        No pending aggregator applications
                    </td>
                </tr>
            `;
            document.getElementById('aggregatorPagination').innerHTML = '';
            return;
        }
        
        // Render paginated table
        renderPaginatedTable('aggregators', tbody, createAggregatorRow);
        
    } catch (error) {
        console.error('❌ Error loading aggregators:', error);
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="placeholder" style="color: red;">
                    Error loading data. Please refresh the page.
                </td>
            </tr>
        `;
    }
}

// ============================================================================
// CREATE AGGREGATOR ROW
// ============================================================================

function createAggregatorRow(agg) {
    const tr = document.createElement('tr');
    tr.setAttribute('data-id', agg.user_id);
    
    tr.innerHTML = `
        <td><strong>${agg.user_id}</strong></td>
        <td>${agg.org_name}</td>
        <td>${agg.type}</td>
        <td>${agg.email}</td>
        <td>${agg.mobile}</td>
        <td>
            <button class="btn btn-small btn-secondary" onclick="viewDocuments('${agg.user_id}', 'aggregator', ${JSON.stringify(agg.documents).replace(/"/g, '&quot;')})">
                <i class="fa-solid fa-file-arrow-down"></i> View Docs
            </button>
        </td>
        <td class="action-buttons">
            <button class="btn btn-small btn-success approve-btn" onclick="approveAggregator('${agg.user_id}', '${agg.org_name}')">
                <i class="fa-solid fa-check"></i> Approve
            </button>
            <button class="btn btn-small btn-danger reject-btn" onclick="rejectAggregator('${agg.user_id}', '${agg.org_name}')">
                <i class="fa-solid fa-times"></i> Reject
            </button>
        </td>
    `;
    
    return tr;
}

// ============================================================================
// LOAD PENDING BUYERS
// ============================================================================

async function loadPendingBuyers() {
    console.log('📋 Loading pending buyers...');
    
    const tbody = document.getElementById('buyerTableBody');
    const countSpan = document.getElementById('pendingBuyerCount');
    
    try {
        const response = await fetch(`${window.API_BASE_URL}/admin/pending_buyers`);
        const data = await response.json();
        
        console.log(`✅ Loaded ${data.count} pending buyers`);
        
        // Store data in state
        paginationState.buyers.allData = data.buyers;
        paginationState.buyers.totalItems = data.count;
        
        // Update count
        countSpan.textContent = data.count;
        
        // Clear table
        tbody.innerHTML = '';
        
        if (data.count === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="placeholder">
                        No pending buyer applications
                    </td>
                </tr>
            `;
            document.getElementById('buyerPagination').innerHTML = '';
            return;
        }
        
        // Render paginated table
        renderPaginatedTable('buyers', tbody, createBuyerRow);
        
    } catch (error) {
        console.error('❌ Error loading buyers:', error);
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="placeholder" style="color: red;">
                    Error loading data. Please refresh the page.
                </td>
            </tr>
        `;
    }
}

// ============================================================================
// CREATE BUYER ROW
// ============================================================================

function createBuyerRow(buyer) {
    const tr = document.createElement('tr');
    tr.setAttribute('data-id', buyer.user_id);
    
    tr.innerHTML = `
        <td><strong>${buyer.user_id}</strong></td>
        <td>${buyer.org_name}</td>
        <td>${buyer.type}</td>
        <td>${buyer.email}</td>
        <td>${buyer.mobile}</td>
        <td>
            <button class="btn btn-small btn-secondary" onclick="viewDocuments('${buyer.user_id}', 'buyer', ${JSON.stringify(buyer.documents).replace(/"/g, '&quot;')})">
                <i class="fa-solid fa-file-arrow-down"></i> View Docs
            </button>
        </td>
        <td class="action-buttons">
            <button class="btn btn-small btn-success approve-btn" onclick="approveBuyer('${buyer.user_id}', '${buyer.org_name}')">
                <i class="fa-solid fa-check"></i> Approve
            </button>
            <button class="btn btn-small btn-danger reject-btn" onclick="rejectBuyer('${buyer.user_id}', '${buyer.org_name}')">
                <i class="fa-solid fa-times"></i> Reject
            </button>
        </td>
    `;
    
    return tr;
}

// ============================================================================
// LOAD APPLICATION HISTORY
// ============================================================================

async function loadApplicationHistory() {
    console.log('📋 Loading application history...');
    
    const tbody = document.getElementById('historyTableBody');
    const countSpan = document.getElementById('historyCount');
    
    try {
        const response = await fetch(`${window.API_BASE_URL}/admin/application_history`);
        const data = await response.json();
        
        console.log(`✅ Loaded ${data.count} historical records`);
        
        // Store data in state
        paginationState.history.allData = data.history;
        paginationState.history.totalItems = data.count;
        
        // Update count
        countSpan.textContent = data.count;
        
        // Clear table
        tbody.innerHTML = '';
        
        if (data.count === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="placeholder">
                        No application history
                    </td>
                </tr>
            `;
            document.getElementById('historyPagination').innerHTML = '';
            return;
        }
        
        // Render paginated table
        renderPaginatedTable('history', tbody, createHistoryRow);
        
    } catch (error) {
        console.error('❌ Error loading history:', error);
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="placeholder" style="color: red;">
                    Error loading data. Please refresh the page.
                </td>
            </tr>
        `;
    }
}

// ============================================================================
// CREATE HISTORY ROW
// ============================================================================

function createHistoryRow(record) {
    const tr = document.createElement('tr');
    
    // Status badge color
    const statusClass = record.status === 'Approved' ? 'tag-approved' : 'tag-rejected';
    const statusIcon = record.status === 'Approved' ? 'fa-check-circle' : 'fa-times-circle';
    
    tr.innerHTML = `
        <td>
            <span class="tag" style="background: ${record.type === 'Aggregator' ? '#3498db' : '#e67e22'}; color: white;">
                ${record.type}
            </span>
        </td>
        <td><strong>${record.user_id}</strong></td>
        <td>${record.org_name}</td>
        <td>${record.org_type}</td>
        <td>${record.email}</td>
        <td>${record.mobile}</td>
        <td>
            <button class="btn btn-small btn-secondary" onclick="viewDocuments('${record.user_id}', '${record.type.toLowerCase()}', ${JSON.stringify(record.documents).replace(/"/g, '&quot;')})">
                <i class="fa-solid fa-file-arrow-down"></i> View Docs
            </button>
        </td>
        <td>
            <span class="tag ${statusClass}">
                <i class="fas ${statusIcon}"></i> ${record.status}
            </span>
        </td>
    `;
    
    return tr;
}

// ============================================================================
// PAGINATION FUNCTIONS
// ============================================================================

function renderPaginatedTable(tableType, tbody, rowCreator) {
    const state = paginationState[tableType];
    const { currentPage, itemsPerPage, allData } = state;
    
    // Calculate pagination
    const totalPages = Math.ceil(allData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageItems = allData.slice(startIndex, endIndex);
    
    console.log(`📄 ${tableType}: Page ${currentPage}/${totalPages}, showing ${pageItems.length} items (${startIndex + 1}-${Math.min(endIndex, allData.length)} of ${allData.length})`);
    
    // Clear table
    tbody.innerHTML = '';
    
    // Render rows for current page
    pageItems.forEach(item => {
        const row = rowCreator(item);
        tbody.appendChild(row);
    });
    console.log(`🔧 About to render pagination for ${tableType}, totalPages=${totalPages}`);
    // Render pagination controls
    renderPaginationControls(tableType, totalPages);
}

function renderPaginationControls(tableType, totalPages) {
    const state = paginationState[tableType];
    const { currentPage, totalItems } = state;
    
    console.log(`🔧 Rendering pagination for ${tableType}: Page ${currentPage}/${totalPages}, Total items: ${totalItems}`);
    
    // Get pagination container - REMOVE TRAILING 'S' FROM tableType
    const tableTypeSingular = tableType.endsWith('s') ? tableType.slice(0, -1) : tableType;
    const paginationId = `${tableTypeSingular}Pagination`;
    
    console.log(`🔍 Looking for container: ${paginationId} (from ${tableType})`);
    
    const container = document.getElementById(paginationId);
    
    if (!container) {
        console.error(`❌ Pagination container not found: ${paginationId}`);
        console.error(`   Available containers:`, {
            aggregator: document.getElementById('aggregatorPagination'),
            buyer: document.getElementById('buyerPagination'),
            history: document.getElementById('historyPagination')
        });
        return;
    }
    
    console.log(`✅ Found container: ${paginationId}`);
    
    // Always show pagination (even for 1 page)
    // Build pagination HTML with right alignment
    let html = '<div class="pagination" style="justify-content: flex-end;">';
    
    // Previous button
    if (currentPage > 1 && totalPages > 1) {
        html += `
            <button class="btn btn-small" onclick="changePage('${tableType}', ${currentPage - 1})">
                <i class="fas fa-chevron-left"></i> Previous
            </button>
        `;
    } else {
        html += `
            <button class="btn btn-small" disabled>
                <i class="fas fa-chevron-left"></i> Previous
            </button>
        `;
    }
    
    // Page indicator - always show
    html += `
        <span class="page-info">
            Page ${currentPage} of ${totalPages > 0 ? totalPages : 1}
        </span>
    `;
    
    // Next button
    if (currentPage < totalPages && totalPages > 1) {
        html += `
            <button class="btn btn-small" onclick="changePage('${tableType}', ${currentPage + 1})">
                Next <i class="fas fa-chevron-right"></i>
            </button>
        `;
    } else {
        html += `
            <button class="btn btn-small" disabled>
                Next <i class="fas fa-chevron-right"></i>
            </button>
        `;
    }
    
    html += '</div>';
    
    container.innerHTML = html;
    console.log(`✅ Pagination rendered for ${tableType}`);
}

function changePage(tableType, newPage) {
    console.log(`📄 Changing ${tableType} to page ${newPage}`);
    
    paginationState[tableType].currentPage = newPage;
    
    // Re-render with stored data
    const tbody = document.getElementById(
        tableType === 'aggregators' ? 'aggregatorTableBody' :
        tableType === 'buyers' ? 'buyerTableBody' :
        'historyTableBody'
    );
    
    const rowCreator = 
        tableType === 'aggregators' ? createAggregatorRow :
        tableType === 'buyers' ? createBuyerRow :
        createHistoryRow;
    
    renderPaginatedTable(tableType, tbody, rowCreator);
    
    // Scroll to top of table
    tbody.closest('.card').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Make changePage globally accessible
window.changePage = changePage;

// ============================================================================
// APPROVE AGGREGATOR
// ============================================================================

async function approveAggregator(aggregatorId, name) {
    if (!confirm(`Approve aggregator "${name}"?`)) {
        return;
    }
    
    console.log(`✅ Approving aggregator: ${aggregatorId}`);
    
    const row = document.querySelector(`#aggregatorTableBody tr[data-id="${aggregatorId}"]`);
    const actionCell = row.querySelector('.action-buttons');
    
    // Show loading
    actionCell.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    
    try {
        const response = await fetch(`${window.API_BASE_URL}/admin/approve_aggregator/${aggregatorId}`, {
            method: 'PUT'
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.detail || 'Approval failed');
        }
        
        console.log(`✅ Aggregator approved: ${aggregatorId}`);
        
        // Show success message
        alert(`✅ ${data.message}`);
        
        // Calculate which page to stay on after deletion
        const state = paginationState.aggregators;
        const totalItems = state.totalItems - 1; // One less item
        const totalPages = Math.ceil(totalItems / state.itemsPerPage);
        
        // If current page would be empty, go to previous page
        if (state.currentPage > totalPages && state.currentPage > 1) {
            state.currentPage = totalPages;
        }
        
        // Reload data from server
        setTimeout(async () => {
            await loadPendingAggregators();
            await loadApplicationHistory();
        }, 300);
        
    } catch (error) {
        console.error('❌ Error approving aggregator:', error);
        alert(`❌ Error: ${error.message}`);
        
        // Restore buttons
        actionCell.innerHTML = `
            <button class="btn btn-small btn-success approve-btn" onclick="approveAggregator('${aggregatorId}', '${name}')">
                <i class="fa-solid fa-check"></i> Approve
            </button>
            <button class="btn btn-small btn-danger reject-btn" onclick="rejectAggregator('${aggregatorId}', '${name}')">
                <i class="fa-solid fa-times"></i> Reject
            </button>
        `;
    }
}

// ============================================================================
// REJECT AGGREGATOR
// ============================================================================

async function rejectAggregator(aggregatorId, name) {
    if (!confirm(`Reject aggregator "${name}"? This action cannot be undone.`)) {
        return;
    }
    
    console.log(`❌ Rejecting aggregator: ${aggregatorId}`);
    
    const row = document.querySelector(`#aggregatorTableBody tr[data-id="${aggregatorId}"]`);
    const actionCell = row.querySelector('.action-buttons');
    
    // Show loading
    actionCell.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    
    try {
        const response = await fetch(`${window.API_BASE_URL}/admin/reject_aggregator/${aggregatorId}`, {
            method: 'PUT'
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.detail || 'Rejection failed');
        }
        
        console.log(`❌ Aggregator rejected: ${aggregatorId}`);
        
        // Show success message
        alert(`✅ ${data.message}`);
        
        // Calculate which page to stay on after deletion
        const state = paginationState.aggregators;
        const totalItems = state.totalItems - 1; // One less item
        const totalPages = Math.ceil(totalItems / state.itemsPerPage);
        
        // If current page would be empty, go to previous page
        if (state.currentPage > totalPages && state.currentPage > 1) {
            state.currentPage = totalPages;
        }
        
        // Reload data from server
        setTimeout(async () => {
            await loadPendingAggregators();
            await loadApplicationHistory();
        }, 300);
        
    } catch (error) {
        console.error('❌ Error rejecting aggregator:', error);
        alert(`❌ Error: ${error.message}`);
        
        // Restore buttons
        actionCell.innerHTML = `
            <button class="btn btn-small btn-success approve-btn" onclick="approveAggregator('${aggregatorId}', '${name}')">
                <i class="fa-solid fa-check"></i> Approve
            </button>
            <button class="btn btn-small btn-danger reject-btn" onclick="rejectAggregator('${aggregatorId}', '${name}')">
                <i class="fa-solid fa-times"></i> Reject
            </button>
        `;
    }
}

// ============================================================================
// APPROVE BUYER
// ============================================================================

async function approveBuyer(buyerId, name) {
    if (!confirm(`Approve buyer "${name}"?`)) {
        return;
    }
    
    console.log(`✅ Approving buyer: ${buyerId}`);
    
    const row = document.querySelector(`#buyerTableBody tr[data-id="${buyerId}"]`);
    const actionCell = row.querySelector('.action-buttons');
    
    // Show loading
    actionCell.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    
    try {
        const response = await fetch(`${window.API_BASE_URL}/admin/approve_buyer/${buyerId}`, {
            method: 'PUT'
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.detail || 'Approval failed');
        }
        
        console.log(`✅ Buyer approved: ${buyerId}`);
        
        // Show success message
        alert(`✅ ${data.message}`);
        
        // Calculate which page to stay on after deletion
        const state = paginationState.buyers;
        const totalItems = state.totalItems - 1; // One less item
        const totalPages = Math.ceil(totalItems / state.itemsPerPage);
        
        // If current page would be empty, go to previous page
        if (state.currentPage > totalPages && state.currentPage > 1) {
            state.currentPage = totalPages;
        }
        
        // Reload data from server
        setTimeout(async () => {
            await loadPendingBuyers();
            await loadApplicationHistory();
        }, 300);
        
    } catch (error) {
        console.error('❌ Error approving buyer:', error);
        alert(`❌ Error: ${error.message}`);
        
        // Restore buttons
        actionCell.innerHTML = `
            <button class="btn btn-small btn-success approve-btn" onclick="approveBuyer('${buyerId}', '${name}')">
                <i class="fa-solid fa-check"></i> Approve
            </button>
            <button class="btn btn-small btn-danger reject-btn" onclick="rejectBuyer('${buyerId}', '${name}')">
                <i class="fa-solid fa-times"></i> Reject
            </button>
        `;
    }
}

// ============================================================================
// REJECT BUYER
// ============================================================================

async function rejectBuyer(buyerId, name) {
    if (!confirm(`Reject buyer "${name}"? This action cannot be undone.`)) {
        return;
    }
    
    console.log(`❌ Rejecting buyer: ${buyerId}`);
    
    const row = document.querySelector(`#buyerTableBody tr[data-id="${buyerId}"]`);
    const actionCell = row.querySelector('.action-buttons');
    
    // Show loading
    actionCell.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    
    try {
        const response = await fetch(`${window.API_BASE_URL}/admin/reject_buyer/${buyerId}`, {
            method: 'PUT'
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.detail || 'Rejection failed');
        }
        
        console.log(`❌ Buyer rejected: ${buyerId}`);
        
        // Show success message
        alert(`✅ ${data.message}`);
        
        // Calculate which page to stay on after deletion
        const state = paginationState.buyers;
        const totalItems = state.totalItems - 1; // One less item
        const totalPages = Math.ceil(totalItems / state.itemsPerPage);
        
        // If current page would be empty, go to previous page
        if (state.currentPage > totalPages && state.currentPage > 1) {
            state.currentPage = totalPages;
        }
        
        // Reload data from server
        setTimeout(async () => {
            await loadPendingBuyers();
            await loadApplicationHistory();
        }, 300);
        
    } catch (error) {
        console.error('❌ Error rejecting buyer:', error);
        alert(`❌ Error: ${error.message}`);
        
        // Restore buttons
        actionCell.innerHTML = `
            <button class="btn btn-small btn-success approve-btn" onclick="approveBuyer('${buyerId}', '${name}')">
                <i class="fa-solid fa-check"></i> Approve
            </button>
            <button class="btn btn-small btn-danger reject-btn" onclick="rejectBuyer('${buyerId}', '${name}')">
                <i class="fa-solid fa-times"></i> Reject
            </button>
        `;
    }
}

// ============================================================================
// VIEW DOCUMENTS
// ============================================================================

async function viewDocuments(id, type, documents) {
    console.log(`📄 Viewing documents for ${type}: ${id}`);
    console.log('📋 Documents object:', documents);
    
    const modal = document.getElementById('docModal');
    const modalBody = document.getElementById('docModalBody');
    
    if (!modal || !modalBody) {
        console.error('❌ Modal elements not found!');
        alert('Error: Modal not found. Please refresh the page.');
        return;
    }
    
    // Show loading state
    modalBody.innerHTML = `
        <div style="text-align: center; padding: 3rem;">
            <i class="fas fa-spinner fa-spin" style="font-size: 3rem; color: #667eea;"></i>
            <p style="margin-top: 1rem; color: #666;">Loading documents and details...</p>
        </div>
    `;
    modal.style.display = 'block';
    
    // =========================================================================
    // FETCH FULL USER DATA FOR REGISTRATION FORM
    // =========================================================================
    
    let userData = null;
    try {
        const endpoint = type === 'aggregator' 
            ? `${window.API_BASE_URL}/admin/pending_aggregators`
            : `${window.API_BASE_URL}/admin/pending_buyers`;
        
        console.log(`📡 Fetching data from: ${endpoint}`);
        
        const response = await fetch(endpoint);
        const data = await response.json();
        
        // Find the specific user
        const userList = type === 'aggregator' ? data.aggregators : data.buyers;
        userData = userList.find(u => u.user_id === id);
        
        console.log('✅ User data fetched:', userData);
    } catch (error) {
        console.error('❌ Error fetching user data:', error);
    }
    
    // =========================================================================
    // BUILD HTML CONTENT
    // =========================================================================
    
    let html = `
        <div class="doc-viewer">
            <!-- Header -->
            <div style="margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 3px solid #667eea;">
                <h3 style="margin: 0 0 0.5rem 0; color: #2c3e50;">
                    <i class="fas fa-folder-open"></i> 
                    Documents & Registration Details
                </h3>
                <p style="color: #7f8c8d; margin: 0; font-size: 0.95rem;">
                    <strong>User ID:</strong> ${id} &nbsp;|&nbsp; 
                    <strong>Type:</strong> ${type.charAt(0).toUpperCase() + type.slice(1)}
                </p>
            </div>
    `;
    
    // =========================================================================
    // CATEGORIZE DOCUMENTS (UPLOADED vs NOT UPLOADED)
    // =========================================================================
    
    const uploadedDocs = [];
    const notUploadedDocs = [];
    
    const docTypes = [
        { key: 'registration', label: 'Registration Certificate', icon: 'certificate' },
        { key: 'pan', label: 'PAN Card', icon: 'id-card' },
        { key: 'aadhar', label: 'Aadhar Card', icon: 'address-card' }
    ];
    
    docTypes.forEach(({ key, label, icon }) => {
        if (documents[key] && documents[key] !== null && documents[key] !== '') {
            uploadedDocs.push({ key, label, icon, path: documents[key] });
        } else {
            notUploadedDocs.push({ key, label, icon });
        }
    });
    
    console.log(`📊 Uploaded: ${uploadedDocs.length}, Not Uploaded: ${notUploadedDocs.length}`);
    
    // =========================================================================
    // SECTION 1: UPLOADED DOCUMENTS (GREEN) - INLINE VIEWER
    // =========================================================================
    
    if (uploadedDocs.length > 0) {
        html += `
            <div style="background: #f1f8f4; border: 2px solid #4caf50; border-radius: 10px; padding: 1.5rem; margin-bottom: 1.5rem;">
                <h4 style="margin: 0 0 1.2rem 0; color: #2e7d32; display: flex; align-items: center; gap: 0.5rem; padding-bottom: 0.8rem; border-bottom: 2px solid rgba(76, 175, 80, 0.3);">
                    <i class="fas fa-check-circle" style="font-size: 1.3rem;"></i>
                    Uploaded Documents (${uploadedDocs.length})
                </h4>
        `;
        
        uploadedDocs.forEach(({ key, label, icon, path }) => {
            
            // Convert Windows path to URL path
            let safePath = String(path || '').trim().replace(/\\/g, '/');
            safePath = safePath.replace(/^\/+/, ''); // remove starting /

            // ✅ IMPORTANT: use safePath (NOT path) for URL and extension
            const fullUrl = `${window.API_BASE_URL}/${safePath}`;
            const fileExt = safePath.split('.').pop().toLowerCase();
            const isPDF = fileExt === 'pdf';
            const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(fileExt);

            // Debug logs (optional)
            console.log("RAW path from DB:", path);
            console.log("SAFE path:", safePath);
            console.log("FULL URL:", fullUrl);
            html += `
                <div style="background: white; padding: 1rem 1.2rem; margin-bottom: 0.8rem; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; border: 1px solid #c8e6c9; transition: all 0.2s;">
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <i class="fas fa-${icon}" style="font-size: 1.8rem; color: #4caf50;"></i>
                        <div>
                            <strong style="display: block; color: #2c3e50; font-size: 1rem;">${label}</strong>
                            <small style="color: #666; font-size: 0.85rem;">
                                ${fileExt.toUpperCase()} • 
                                ${isPDF ? 'PDF Document' : isImage ? 'Image File' : 'Document'}
                            </small>
                        </div>
                    </div>
                    <button 
                        onclick="viewInlineDocument('${fullUrl.replace(/'/g, "\\'")}', '${label.replace(/'/g, "\\'")}', ${isPDF}, ${isImage})" 
                        class="btn btn-small btn-primary"
                        style="background: #4caf50; border: none; color: white; padding: 0.6rem 1.2rem; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; transition: all 0.2s;"
                        onmouseover="this.style.background='#45a049'; this.style.transform='translateY(-2px)'"
                        onmouseout="this.style.background='#4caf50'; this.style.transform='translateY(0)'"
                    >
                        <i class="fas fa-eye"></i> View Document
                    </button>
                </div>
            `;
        });
        
        html += `</div>`;
    }
    
    // =========================================================================
    // SECTION 2: NOT UPLOADED DOCUMENTS (GRAY)
    // =========================================================================
    
    if (notUploadedDocs.length > 0) {
        html += `
            <div style="background: #f8f9fa; border: 2px solid #e0e0e0; border-radius: 10px; padding: 1.5rem; margin-bottom: 1.5rem;">
                <h4 style="margin: 0 0 1.2rem 0; color: #757575; display: flex; align-items: center; gap: 0.5rem; padding-bottom: 0.8rem; border-bottom: 2px solid rgba(0, 0, 0, 0.1);">
                    <i class="fas fa-times-circle" style="font-size: 1.3rem;"></i>
                    Not Uploaded (${notUploadedDocs.length})
                </h4>
        `;
        
        notUploadedDocs.forEach(({ label, icon }) => {
            html += `
                <div style="background: white; padding: 1rem 1.2rem; margin-bottom: 0.8rem; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; border: 1px solid #e0e0e0; opacity: 0.7;">
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <i class="fas fa-${icon}" style="font-size: 1.8rem; color: #9e9e9e;"></i>
                        <strong style="color: #757575; font-size: 1rem;">${label}</strong>
                    </div>
                    <span style="padding: 0.5rem 1rem; background: #e0e0e0; color: #757575; border-radius: 20px; font-size: 0.85rem; font-weight: 500;">
                        Not Uploaded
                    </span>
                </div>
            `;
        });
        
        html += `</div>`;
    }
    
    // =========================================================================
    // SECTION 3: REGISTRATION FORM DATA (BLUE)
    // =========================================================================
    
    if (userData) {
        html += `
            <div style="background: #e3f2fd; border: 2px solid #2196f3; border-radius: 10px; padding: 1.5rem;">
                <h4 style="margin: 0 0 1.2rem 0; color: #1976d2; display: flex; align-items: center; gap: 0.5rem; padding-bottom: 0.8rem; border-bottom: 2px solid rgba(33, 150, 243, 0.3);">
                    <i class="fas fa-clipboard-list" style="font-size: 1.3rem;"></i>
                    Registration Form Details
                </h4>
                
                <div style="background: white; padding: 1.5rem; border-radius: 8px; display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.2rem;">
                    
                    <div style="display: flex; flex-direction: column; gap: 0.4rem;">
                        <label style="font-size: 0.8rem; font-weight: 600; color: #546e7a; text-transform: uppercase; letter-spacing: 0.5px;">User ID</label>
                        <span style="padding: 0.7rem; background: #f5f5f5; border-radius: 6px; border: 1px solid #e0e0e0; color: #2c3e50;">${userData.user_id || 'N/A'}</span>
                    </div>
                    
                    <div style="display: flex; flex-direction: column; gap: 0.4rem;">
                        <label style="font-size: 0.8rem; font-weight: 600; color: #546e7a; text-transform: uppercase; letter-spacing: 0.5px;">Organisation Name</label>
                        <span style="padding: 0.7rem; background: #f5f5f5; border-radius: 6px; border: 1px solid #e0e0e0; color: #2c3e50;">${userData.org_name || 'N/A'}</span>
                    </div>
                    
                    <div style="display: flex; flex-direction: column; gap: 0.4rem;">
                        <label style="font-size: 0.8rem; font-weight: 600; color: #546e7a; text-transform: uppercase; letter-spacing: 0.5px;">Organisation Type</label>
                        <span style="padding: 0.7rem; background: #f5f5f5; border-radius: 6px; border: 1px solid #e0e0e0; color: #2c3e50;">${userData.type || 'N/A'}</span>
                    </div>
                    
                    <div style="display: flex; flex-direction: column; gap: 0.4rem;">
                        <label style="font-size: 0.8rem; font-weight: 600; color: #546e7a; text-transform: uppercase; letter-spacing: 0.5px;">Email</label>
                        <span style="padding: 0.7rem; background: #f5f5f5; border-radius: 6px; border: 1px solid #e0e0e0; color: #2c3e50;">${userData.email || 'N/A'}</span>
                    </div>
                    
                    <div style="display: flex; flex-direction: column; gap: 0.4rem;">
                        <label style="font-size: 0.8rem; font-weight: 600; color: #546e7a; text-transform: uppercase; letter-spacing: 0.5px;">Mobile</label>
                        <span style="padding: 0.7rem; background: #f5f5f5; border-radius: 6px; border: 1px solid #e0e0e0; color: #2c3e50;">${userData.mobile || 'N/A'}</span>
                    </div>
                    
                    <div style="display: flex; flex-direction: column; gap: 0.4rem;">
                        <label style="font-size: 0.8rem; font-weight: 600; color: #546e7a; text-transform: uppercase; letter-spacing: 0.5px;">Phone</label>
                        <span style="padding: 0.7rem; background: #f5f5f5; border-radius: 6px; border: 1px solid #e0e0e0; color: #2c3e50;">${userData.phone || 'N/A'}</span>
                    </div>
                    
                    <div style="grid-column: 1 / -1; display: flex; flex-direction: column; gap: 0.4rem;">
                        <label style="font-size: 0.8rem; font-weight: 600; color: #546e7a; text-transform: uppercase; letter-spacing: 0.5px;">Address</label>
                        <span style="padding: 0.7rem; background: #f5f5f5; border-radius: 6px; border: 1px solid #e0e0e0; color: #2c3e50;">${userData.address || 'N/A'}</span>
                    </div>
                    
                    <div style="display: flex; flex-direction: column; gap: 0.4rem;">
                        <label style="font-size: 0.8rem; font-weight: 600; color: #546e7a; text-transform: uppercase; letter-spacing: 0.5px;">Username</label>
                        <span style="padding: 0.7rem; background: #f5f5f5; border-radius: 6px; border: 1px solid #e0e0e0; color: #2c3e50;">${userData.username || 'N/A'}</span>
                    </div>
                    
                    <div style="display: flex; flex-direction: column; gap: 0.4rem;">
                        <label style="font-size: 0.8rem; font-weight: 600; color: #546e7a; text-transform: uppercase; letter-spacing: 0.5px;">Created At</label>
                        <span style="padding: 0.7rem; background: #f5f5f5; border-radius: 6px; border: 1px solid #e0e0e0; color: #2c3e50;">${userData.created_at ? new Date(userData.created_at).toLocaleString() : 'N/A'}</span>
                    </div>
                    
                </div>
            </div>
        `;
    } else {
        html += `
            <div style="background: #fff3cd; border: 2px solid #ffc107; border-radius: 10px; padding: 1.5rem; text-align: center;">
                <i class="fas fa-exclamation-triangle" style="font-size: 2rem; color: #ff9800; margin-bottom: 0.5rem;"></i>
                <p style="margin: 0; color: #856404;">Unable to load registration form details. Please try again.</p>
            </div>
        `;
    }
    
    html += `</div>`; // Close doc-viewer
    
    // =========================================================================
    // UPDATE MODAL AND DISPLAY
    // =========================================================================
    
    modalBody.innerHTML = html;
    modal.style.display = 'block';
    
    console.log('✅ Document viewer displayed successfully');
}

// ============================================================================
// VIEW INLINE DOCUMENT - NEW FUNCTION FOR VIEWING (NOT DOWNLOADING)
// ============================================================================

function viewInlineDocument(fileUrl, fileName, isPDF, isImage) {
    console.log(`👁️ Viewing inline: ${fileName}`);
    console.log(`   URL: ${fileUrl}`);
    console.log(`   Type: ${isPDF ? 'PDF' : isImage ? 'Image' : 'Other'}`);
    
    // Create a new modal for the document viewer
    let viewerModal = document.getElementById('documentViewerModal');
    
    if (!viewerModal) {
        // Create modal if it doesn't exist
        viewerModal = document.createElement('div');
        viewerModal.id = 'documentViewerModal';
        viewerModal.className = 'modal';
        viewerModal.innerHTML = `
            <div class="modal-content" style="max-width: 95%; height: 90vh;">
                <div class="modal-header">
                    <h3 id="docViewerTitle"><i class="fas fa-file"></i> Document Viewer</h3>
                    <span class="close-btn" onclick="closeDocumentViewer()">&times;</span>
                </div>
                <div class="modal-body" id="docViewerBody" style="padding: 0; height: calc(90vh - 80px); overflow: hidden;">
                    <!-- Document content here -->
                </div>
            </div>
        `;
        document.body.appendChild(viewerModal);
    }
    
    const viewerBody = document.getElementById('docViewerBody');
    const viewerTitle = document.getElementById('docViewerTitle');
    
    viewerTitle.innerHTML = `<i class="fas fa-file"></i> ${fileName}`;
    
    if (isPDF) {
        // Display PDF inline using iframe
        viewerBody.innerHTML = `
            <iframe 
                src="${fileUrl}" 
                style="width: 100%; height: 100%; border: none;"
                title="${fileName}"
            ></iframe>
        `;
    } else if (isImage) {
        // Display image inline
        viewerBody.innerHTML = `
            <div style="width: 100%; height: 100%; display: flex; justify-content: center; align-items: center; background: #f5f5f5;">
                <img 
                    src="${fileUrl}" 
                    alt="${fileName}"
                    style="max-width: 100%; max-height: 100%; object-fit: contain;"
                />
            </div>
        `;
    } else {
        // For other file types, provide download option
        viewerBody.innerHTML = `
            <div style="padding: 3rem; text-align: center;">
                <i class="fas fa-file-download" style="font-size: 4rem; color: #2196f3; margin-bottom: 1rem;"></i>
                <h3 style="margin-bottom: 1rem;">Preview not available</h3>
                <p style="color: #666; margin-bottom: 2rem;">This file type cannot be previewed in the browser.</p>
                <a href="${fileUrl}" target="_blank" class="btn btn-primary" style="padding: 1rem 2rem; font-size: 1.1rem;">
                    <i class="fas fa-external-link-alt"></i> Open in New Tab
                </a>
            </div>
        `;
    }
    
    viewerModal.style.display = 'block';
}

// ============================================================================
// CLOSE DOCUMENT VIEWER
// ============================================================================

function closeDocumentViewer() {
    const viewerModal = document.getElementById('documentViewerModal');
    if (viewerModal) {
        viewerModal.style.display = 'none';
    }
}

// ============================================================================
// CLOSE MAIN DOCUMENT MODAL
// ============================================================================

function closeDocModal() {
    document.getElementById('docModal').style.display = 'none';
}

// ============================================================================
// MODAL CLOSE HANDLERS
// ============================================================================

// Close modal on outside click
window.onclick = function(event) {
    const docModal = document.getElementById('docModal');
    const viewerModal = document.getElementById('documentViewerModal');
    
    if (event.target === docModal) {
        closeDocModal();
    }
    if (event.target === viewerModal) {
        closeDocumentViewer();
    }
};

// Close modal on Escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const docModal = document.getElementById('docModal');
        const viewerModal = document.getElementById('documentViewerModal');
        
        // Close viewer modal first if it's open
        if (viewerModal && viewerModal.style.display === 'block') {
            closeDocumentViewer();
        } else if (docModal && docModal.style.display === 'block') {
            closeDocModal();
        }
    }
});

// Make functions globally accessible
window.viewInlineDocument = viewInlineDocument;
window.closeDocumentViewer = closeDocumentViewer;
