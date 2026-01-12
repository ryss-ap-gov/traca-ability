/**
 * =============================================================================
 * CATCHMENT AREA PAGE - JAVASCRIPT
 * =============================================================================
 * 
 * Handles:
 * - Tab switching between "Request New Catchment Area" and "Request Farmer"
 * - Cascading dropdown population:
 *   Location: District → Mandal → Panchayat → Village → VO → SHG
 *   Crops: Crop → Variety (Option B: show NA)
 * - Season and Period from API
 * - Form validation with inline error messages
 * - NA fallback strategy for optional fields (VO, SHG, Variety)
 * 
 * API Endpoints Used:
 *   GET /api/demographics/districts
 *   GET /api/demographics/mandals/{district_id}
 *   GET /api/demographics/panchayats/{mandal_id}
 *   GET /api/demographics/villages/{panchayat_id}
 *   GET /api/demographics/vo/{village_id}           (future)
 *   GET /api/demographics/shg/{village_id}?vo_id=   (future)
 *   GET /api/demographics/crops
 *   GET /api/demographics/seasons
 */

const API_BASE_URL = 'http://localhost:8000';

// Store season-period data for filtering
let seasonPeriodData = [];

// =============================================================================
// TAB SWITCHING
// =============================================================================

document.addEventListener('DOMContentLoaded', function () {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            const tabId = this.getAttribute('data-tab');

            // Remove active from all
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // Add active to clicked
            this.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });

    // Initialize dropdowns and forms
    initializeDropdowns();
    setupFormHandlers();
});

// =============================================================================
// DROPDOWN INITIALIZATION
// =============================================================================

async function initializeDropdowns() {
    console.log('[INIT] Starting dropdown initialization...');

    // Initialize optional dropdowns with NA
    resetToNA('vo');
    resetToNA('shg');

    // Load all dropdowns in parallel for efficiency
    await Promise.all([
        loadDistricts(),
        loadCrops(),
        loadSeasonPeriods()
    ]);

    console.log('[INIT] All dropdowns initialized');
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

function showError(message) {
    const errorDiv = document.getElementById('requestErrorMsg');
    const errorText = document.getElementById('errorText');

    if (errorDiv && errorText) {
        errorText.textContent = message;
        errorDiv.style.display = 'block';

        // Scroll to error
        errorDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // Auto-hide after 10 seconds
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 10000);
    }

    console.error('[ERROR]', message);
}

function hideError() {
    const errorDiv = document.getElementById('requestErrorMsg');
    if (errorDiv) {
        errorDiv.style.display = 'none';
    }
}

function showFieldError(fieldId, message) {
    const errorSpan = document.getElementById(`${fieldId}-error`);
    if (errorSpan) {
        errorSpan.textContent = message;
        errorSpan.style.display = 'block';
    }

    // Also highlight the field
    const field = document.getElementById(fieldId);
    if (field) {
        field.style.borderColor = '#dc3545';
    }
}

function clearFieldError(fieldId) {
    const errorSpan = document.getElementById(`${fieldId}-error`);
    if (errorSpan) {
        errorSpan.style.display = 'none';
    }

    const field = document.getElementById(fieldId);
    if (field) {
        field.style.borderColor = '';
    }
}

function clearAllFieldErrors() {
    const errorSpans = document.querySelectorAll('.field-error');
    errorSpans.forEach(span => span.style.display = 'none');

    const formControls = document.querySelectorAll('.form-control');
    formControls.forEach(ctrl => ctrl.style.borderColor = '');
}

function setDropdownLoading(selectId, message = 'Loading...') {
    const select = document.getElementById(selectId);
    if (select) {
        select.innerHTML = `<option value="">${message}</option>`;
        select.disabled = true;
    }
}

function setDropdownError(selectId, message = 'Error loading data') {
    const select = document.getElementById(selectId);
    if (select) {
        select.innerHTML = `<option value="">${message}</option>`;
        select.disabled = true;
    }
}

function resetDropdown(id, placeholder) {
    const select = document.getElementById(id);
    if (select) {
        select.innerHTML = `<option value="">${placeholder}</option>`;
        select.disabled = true;
    }
}

/**
 * Reset dropdown to NA (for optional fields like VO, SHG, Variety)
 * This is the NA fallback strategy
 */
function resetToNA(id) {
    const select = document.getElementById(id);
    if (select) {
        select.innerHTML = '<option value="">NA</option>';
        select.disabled = false; // Keep enabled for optional fields
    }
}

function getSelectedText(selectElement) {
    if (selectElement && selectElement.selectedIndex >= 0) {
        return selectElement.options[selectElement.selectedIndex].text;
    }
    return '';
}

function getSelectedValue(selectElement) {
    if (selectElement && selectElement.selectedIndex >= 0) {
        return selectElement.options[selectElement.selectedIndex].value;
    }
    return '';
}

// =============================================================================
// CASCADING DROPDOWNS - LOCATION (District → Mandal → Panchayat → Village → VO → SHG)
// =============================================================================

async function loadDistricts() {
    const districtSelect = document.getElementById('district');
    setDropdownLoading('district', 'Loading districts...');

    try {
        const response = await fetch(`${API_BASE_URL}/api/demographics/districts`);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        districtSelect.innerHTML = '<option value="">Select District...</option>';
        districtSelect.disabled = false;

        if (data.success && data.districts && data.districts.length > 0) {
            data.districts.forEach(d => {
                const option = document.createElement('option');
                option.value = d.id;
                option.textContent = d.name || 'NA';
                option.dataset.name = d.name || 'NA';
                districtSelect.appendChild(option);
            });
            console.log(`[OK] Loaded ${data.districts.length} districts`);
        } else {
            console.warn('[WARN] No districts found in database');
            districtSelect.innerHTML = '<option value="">No districts available</option>';
            showError('No districts found. Please run the URVI sync script on the backend.');
        }
    } catch (error) {
        console.error('Error loading districts:', error);
        setDropdownError('district', 'Error loading districts');
        showError('Failed to load districts. Please check if the backend server is running.');
    }

    // Setup cascading event
    districtSelect.addEventListener('change', function () {
        const districtId = this.value;

        // Reset ALL downstream dropdowns
        resetDropdown('mandal', 'Select Mandal...');
        resetDropdown('panchayat', 'Select Panchayat...');
        resetDropdown('village', 'Select Village...');
        resetToNA('vo');
        resetToNA('shg');

        if (districtId) {
            loadMandals(districtId);
        }
    });
}


async function loadMandals(districtId) {
    const mandalSelect = document.getElementById('mandal');
    setDropdownLoading('mandal', 'Loading mandals...');

    try {
        const response = await fetch(`${API_BASE_URL}/api/demographics/mandals/${encodeURIComponent(districtId)}`);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        mandalSelect.innerHTML = '<option value="">Select Mandal...</option>';
        mandalSelect.disabled = false;

        if (data.success && data.mandals && data.mandals.length > 0) {
            data.mandals.forEach(m => {
                const option = document.createElement('option');
                option.value = m.id;
                option.textContent = m.name || 'NA';
                option.dataset.name = m.name || 'NA';
                mandalSelect.appendChild(option);
            });
            console.log(`[OK] Loaded ${data.mandals.length} mandals for district ${districtId}`);
        } else {
            mandalSelect.innerHTML = '<option value="">No mandals found</option>';
        }
    } catch (error) {
        console.error('Error loading mandals:', error);
        setDropdownError('mandal', 'Error loading mandals');
    }

    // Setup cascading event
    mandalSelect.onchange = function () {
        const mandalId = this.value;

        // Reset downstream
        resetDropdown('panchayat', 'Select Panchayat...');
        resetDropdown('village', 'Select Village...');
        resetToNA('vo');
        resetToNA('shg');

        if (mandalId) {
            loadPanchayats(mandalId);
        }
    };
}


async function loadPanchayats(mandalId) {
    const panchayatSelect = document.getElementById('panchayat');
    setDropdownLoading('panchayat', 'Loading panchayats...');

    try {
        const response = await fetch(`${API_BASE_URL}/api/demographics/panchayats/${encodeURIComponent(mandalId)}`);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        panchayatSelect.innerHTML = '<option value="">Select Panchayat...</option>';
        panchayatSelect.disabled = false;

        if (data.success && data.panchayats && data.panchayats.length > 0) {
            data.panchayats.forEach(p => {
                const option = document.createElement('option');
                option.value = p.id;
                option.textContent = p.name || 'NA';
                option.dataset.name = p.name || 'NA';
                panchayatSelect.appendChild(option);
            });
            console.log(`[OK] Loaded ${data.panchayats.length} panchayats for mandal ${mandalId}`);
        } else {
            panchayatSelect.innerHTML = '<option value="">No panchayats found</option>';
        }
    } catch (error) {
        console.error('Error loading panchayats:', error);
        setDropdownError('panchayat', 'Error loading panchayats');
    }

    // Setup cascading event
    panchayatSelect.onchange = function () {
        const panchayatId = this.value;

        // Reset downstream
        resetDropdown('village', 'Select Village...');
        resetToNA('vo');
        resetToNA('shg');

        if (panchayatId) {
            loadVillages(panchayatId);
        }
    };
}


async function loadVillages(panchayatId) {
    const villageSelect = document.getElementById('village');
    setDropdownLoading('village', 'Loading villages...');

    try {
        const response = await fetch(`${API_BASE_URL}/api/demographics/villages/${encodeURIComponent(panchayatId)}`);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        villageSelect.innerHTML = '<option value="">Select Village...</option>';
        villageSelect.disabled = false;

        if (data.success && data.villages && data.villages.length > 0) {
            data.villages.forEach(v => {
                const option = document.createElement('option');
                option.value = v.id;
                option.textContent = v.name || 'NA';
                option.dataset.name = v.name || 'NA';
                villageSelect.appendChild(option);
            });
            console.log(`[OK] Loaded ${data.villages.length} villages for panchayat ${panchayatId}`);
        } else {
            villageSelect.innerHTML = '<option value="">No villages found</option>';
        }
    } catch (error) {
        console.error('Error loading villages:', error);
        setDropdownError('village', 'Error loading villages');
    }

    // Setup cascading event - Village change triggers VO/SHG load
    villageSelect.onchange = function () {
        const villageId = this.value;

        // Reset VO and SHG
        resetToNA('vo');
        resetToNA('shg');

        if (villageId) {
            // Try to load VO list for this village
            loadVOList(villageId);
        }
    };
}

// =============================================================================
// VO AND SHG DROPDOWNS (Optional with NA Fallback)
// =============================================================================

/**
 * Load VO list for a village.
 * If backend doesn't support this endpoint yet, show NA.
 * NA fallback strategy: if empty or error, show NA option.
 */
async function loadVOList(villageId) {
    const voSelect = document.getElementById('vo');
    setDropdownLoading('vo', 'Loading VOs...');

    try {
        // Try to fetch VO list from backend
        const response = await fetch(`${API_BASE_URL}/api/demographics/vo/${encodeURIComponent(villageId)}`);

        if (!response.ok) {
            // Backend endpoint doesn't exist yet - use NA fallback
            console.log('[INFO] VO endpoint not available, using NA fallback');
            resetToNA('vo');
            return;
        }

        const data = await response.json();

        if (data.success && data.vos && data.vos.length > 0) {
            voSelect.innerHTML = '<option value="">Select VO...</option>';
            voSelect.disabled = false;

            // Add actual VO options
            data.vos.forEach(vo => {
                const option = document.createElement('option');
                option.value = vo.id || vo.vo_id || '';
                // NA fallback: if name is empty, show NA
                option.textContent = vo.name || vo.vo_name || 'NA';
                option.dataset.name = vo.name || vo.vo_name || 'NA';
                voSelect.appendChild(option);
            });

            // Add NA option at end for optional selection
            const naOption = document.createElement('option');
            naOption.value = '';
            naOption.textContent = 'NA';
            voSelect.appendChild(naOption);

            console.log(`[OK] Loaded ${data.vos.length} VOs for village ${villageId}`);
        } else {
            // No VOs found - NA fallback
            resetToNA('vo');
            console.log('[INFO] No VOs found, using NA');
        }
    } catch (error) {
        // Error or endpoint doesn't exist - NA fallback
        console.log('[INFO] VO fetch failed, using NA fallback:', error.message);
        resetToNA('vo');
    }

    // Setup VO change handler to load SHGs
    voSelect.onchange = function () {
        const voId = this.value;
        const villageId = document.getElementById('village').value;

        // Reset SHG
        resetToNA('shg');

        if (villageId) {
            // Load SHG list (depends on village, optionally on VO)
            loadSHGList(villageId, voId);
        }
    };
}


/**
 * Load SHG list for a village (and optionally VO).
 * If backend doesn't support this endpoint yet, show NA.
 * NA fallback strategy: if empty or error, show NA option.
 */
async function loadSHGList(villageId, voId = '') {
    const shgSelect = document.getElementById('shg');
    setDropdownLoading('shg', 'Loading SHGs...');

    try {
        // Build URL with optional vo_id
        let url = `${API_BASE_URL}/api/demographics/shg/${encodeURIComponent(villageId)}`;
        if (voId) {
            url += `?vo_id=${encodeURIComponent(voId)}`;
        }

        const response = await fetch(url);

        if (!response.ok) {
            // Backend endpoint doesn't exist yet - use NA fallback
            console.log('[INFO] SHG endpoint not available, using NA fallback');
            resetToNA('shg');
            return;
        }

        const data = await response.json();

        if (data.success && data.shgs && data.shgs.length > 0) {
            shgSelect.innerHTML = '<option value="">Select SHG...</option>';
            shgSelect.disabled = false;

            // Add actual SHG options
            data.shgs.forEach(shg => {
                const option = document.createElement('option');
                option.value = shg.id || shg.shg_id || '';
                // NA fallback: if name is empty, show NA
                option.textContent = shg.name || shg.shg_name || 'NA';
                option.dataset.name = shg.name || shg.shg_name || 'NA';
                shgSelect.appendChild(option);
            });

            // Add NA option at end for optional selection
            const naOption = document.createElement('option');
            naOption.value = '';
            naOption.textContent = 'NA';
            shgSelect.appendChild(naOption);

            console.log(`[OK] Loaded ${data.shgs.length} SHGs for village ${villageId}`);
        } else {
            // No SHGs found - NA fallback
            resetToNA('shg');
            console.log('[INFO] No SHGs found, using NA');
        }
    } catch (error) {
        // Error or endpoint doesn't exist - NA fallback
        console.log('[INFO] SHG fetch failed, using NA fallback:', error.message);
        resetToNA('shg');
    }
}

// =============================================================================
// CROPS DROPDOWN (Option B: variety = "NA" always)
// =============================================================================

async function loadCrops() {
    const cropSelect = document.getElementById('crop');
    setDropdownLoading('crop', 'Loading crops...');

    try {
        const response = await fetch(`${API_BASE_URL}/api/demographics/crops`);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        cropSelect.innerHTML = '<option value="">Select Crop...</option>';
        cropSelect.disabled = false;

        if (data.success && data.crops && data.crops.length > 0) {
            data.crops.forEach(c => {
                const option = document.createElement('option');
                option.value = c.crop_id;
                option.textContent = c.crop_name || 'NA';
                option.dataset.name = c.crop_name || 'NA';
                option.dataset.varietyId = c.crop_variety_id || 'NA';
                option.dataset.varietyName = c.crop_variety_name || 'NA';
                cropSelect.appendChild(option);
            });
            console.log(`[OK] Loaded ${data.crops.length} crops`);
        } else {
            console.warn('[WARN] No crops found in database');
            cropSelect.innerHTML = '<option value="">No crops available</option>';
            showError('No crops found. Please run the URVI sync script on the backend.');
        }
    } catch (error) {
        console.error('Error loading crops:', error);
        setDropdownError('crop', 'Error loading crops');
        showError('Failed to load crops. Please check if the backend server is running.');
    }

    // Setup variety dropdown update when crop changes
    cropSelect.addEventListener('change', function () {
        updateVarietyDropdown(this);
    });
}


function updateVarietyDropdown(cropSelect) {
    const varietySelect = document.getElementById('crop_variety');

    // Always show NA as the default (Option B)
    varietySelect.innerHTML = '<option value="NA">NA - Default Variety</option>';

    const selectedOption = cropSelect.options[cropSelect.selectedIndex];
    if (selectedOption && selectedOption.value) {
        const varietyId = selectedOption.dataset.varietyId || 'NA';
        const varietyName = selectedOption.dataset.varietyName || 'NA';

        // If there's a different variety (not NA), add it as an option
        if (varietyName && varietyName !== 'NA') {
            const option = document.createElement('option');
            option.value = varietyId;
            option.textContent = varietyName;
            option.dataset.name = varietyName;
            varietySelect.appendChild(option);
        }

        varietySelect.disabled = false;
    } else {
        varietySelect.disabled = true;
    }
}

// =============================================================================
// SEASON & PERIOD DROPDOWNS (from API)
// =============================================================================

async function loadSeasonPeriods() {
    const seasonSelect = document.getElementById('season');
    const periodSelect = document.getElementById('period');

    setDropdownLoading('season', 'Loading seasons...');
    setDropdownLoading('period', 'Loading periods...');

    try {
        const response = await fetch(`${API_BASE_URL}/api/demographics/seasons`);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.seasons && data.seasons.length > 0) {
            // Store data for period filtering
            seasonPeriodData = data.seasons;

            // Extract unique seasons
            const uniqueSeasons = [...new Set(data.seasons.map(s => s.season))];

            seasonSelect.innerHTML = '<option value="">Select Season...</option>';
            seasonSelect.disabled = false;

            uniqueSeasons.forEach(season => {
                const option = document.createElement('option');
                option.value = season;
                option.textContent = season || 'NA';
                seasonSelect.appendChild(option);
            });

            // Extract unique periods
            const uniquePeriods = [...new Set(data.seasons.map(s => s.period))].sort().reverse();

            periodSelect.innerHTML = '<option value="">Select Period...</option>';
            periodSelect.disabled = false;

            uniquePeriods.forEach(period => {
                const option = document.createElement('option');
                option.value = period;
                option.textContent = period || 'NA';
                periodSelect.appendChild(option);
            });

            console.log(`[OK] Loaded ${uniqueSeasons.length} seasons and ${uniquePeriods.length} periods`);
        } else {
            console.warn('[WARN] No season-period data found');
            seasonSelect.innerHTML = '<option value="">No seasons available</option>';
            periodSelect.innerHTML = '<option value="">No periods available</option>';
            showError('No season/period data found. Please run URVI sync.');
        }
    } catch (error) {
        console.error('Error loading seasons:', error);
        setDropdownError('season', 'Error loading seasons');
        setDropdownError('period', 'Error loading periods');
        showError('Failed to load seasons. Please check if the backend server is running.');
    }
}

// =============================================================================
// FORM VALIDATION
// =============================================================================

function validateCatchmentForm() {
    let isValid = true;
    clearAllFieldErrors();
    hideError();

    // Only required fields (VO, SHG, Variety are OPTIONAL)
    const requiredFields = [
        { id: 'district', label: 'District' },
        { id: 'mandal', label: 'Mandal' },
        { id: 'panchayat', label: 'Panchayat' },
        { id: 'village', label: 'Village' },
        { id: 'crop', label: 'Crop' },
        { id: 'season', label: 'Season' },
        { id: 'period', label: 'Period' }
    ];

    const missingFields = [];

    requiredFields.forEach(field => {
        const element = document.getElementById(field.id);
        if (!element || !element.value) {
            missingFields.push(field.label);
            showFieldError(field.id, `Please select a ${field.label}`);
            isValid = false;
        }
    });

    if (!isValid) {
        showError(`Please select: ${missingFields.join(', ')}`);
    }

    return isValid;
}

// =============================================================================
// FORM HANDLERS
// =============================================================================

function setupFormHandlers() {
    // Catchment Request Form
    const catchmentForm = document.getElementById('catchmentRequestForm');
    if (catchmentForm) {
        catchmentForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            // Validate first
            if (!validateCatchmentForm()) {
                return;
            }

            await submitCatchmentRequest();
        });
    }

    // Farmer Search Button
    const btnGetFarmer = document.getElementById('btnGetFarmerDetails');
    if (btnGetFarmer) {
        btnGetFarmer.addEventListener('click', getFarmerDetails);
    }

    // Farmer Request Form
    const farmerForm = document.getElementById('farmerCatchmentForm');
    if (farmerForm) {
        farmerForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            await submitFarmerRequest();
        });
    }
}


async function submitCatchmentRequest() {
    // Get user info from localStorage
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    if (!user || !user.user_id) {
        showError('You must be logged in as an aggregator to submit a request.');
        return;
    }

    const aggregatorId = user.user_id;

    // Get form elements
    const districtSelect = document.getElementById('district');
    const mandalSelect = document.getElementById('mandal');
    const panchayatSelect = document.getElementById('panchayat');
    const villageSelect = document.getElementById('village');
    const voSelect = document.getElementById('vo');
    const shgSelect = document.getElementById('shg');
    const cropSelect = document.getElementById('crop');
    const varietySelect = document.getElementById('crop_variety');
    const seasonSelect = document.getElementById('season');
    const periodSelect = document.getElementById('period');

    // Build form data - NO aggregator_id (comes from JWT token now)
    const formData = new FormData();

    // Location - get both ID and Name
    formData.append('district_id', districtSelect.value);
    formData.append('district_name', getSelectedText(districtSelect));
    formData.append('mandal_id', mandalSelect.value);
    formData.append('mandal_name', getSelectedText(mandalSelect));
    formData.append('panchayat_id', panchayatSelect.value);
    formData.append('panchayat_name', getSelectedText(panchayatSelect));
    formData.append('village_id', villageSelect.value);
    formData.append('village_name', getSelectedText(villageSelect));

    // VO and SHG (optional - always send 'NA' for empty/NA selections)
    const voValue = getSelectedValue(voSelect);
    const voName = getSelectedText(voSelect);
    formData.append('vo_id', voValue || '');
    formData.append('vo_name', (!voName || voName === 'NA') ? 'NA' : voName);

    const shgValue = getSelectedValue(shgSelect);
    const shgName = getSelectedText(shgSelect);
    formData.append('shg_id', shgValue || '');
    formData.append('shg_name', (!shgName || shgName === 'NA') ? 'NA' : shgName);

    // Crop
    formData.append('crop_id', cropSelect.value);
    formData.append('crop_name', getSelectedText(cropSelect));

    // Variety (always use NA per Option B)
    const varietyId = varietySelect.value || 'NA';
    const varietyName = getSelectedText(varietySelect) || 'NA';
    formData.append('crop_variety_id', varietyId);
    formData.append('crop_variety_name', varietyName);

    // Season
    formData.append('season', seasonSelect.value);
    formData.append('period', periodSelect.value);

    // Show loading state
    const submitBtn = document.querySelector('#catchmentRequestForm button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
    submitBtn.disabled = true;

    try {
        // Get auth token
        const token = localStorage.getItem('access_token');
        if (!token) {
            showError('Session expired. Please login again.');
            window.location.href = 'login.html';
            return;
        }

        const response = await fetch(`${API_BASE_URL}/api/catchment/request`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            // Show success message
            showSuccessMessage(data, districtSelect, mandalSelect, panchayatSelect, villageSelect, cropSelect, seasonSelect, periodSelect);

            // Reset form
            document.getElementById('catchmentRequestForm').reset();
            resetAllDropdowns();

        } else {
            // Handle specific error codes
            if (response.status === 401) {
                showError('Session expired. Please login again.');
                setTimeout(() => { window.location.href = 'login.html'; }, 2000);
            } else if (response.status === 403) {
                showError('Unauthorized. Only aggregators can submit catchment requests.');
            } else if (response.status === 409 || data.error === 'duplicate') {
                showError(data.message || 'Catchment request already exists for this Village + Crop + Season + Period.');
            } else if (response.status === 422) {
                showError('Validation error. Please check all required fields.');
            } else {
                showError('Error: ' + (data.message || data.error || 'Failed to submit request'));
            }
        }
    } catch (error) {
        console.error('Error submitting request:', error);
        showError('Connection error. Please check if the backend server is running.');
    } finally {
        // Restore button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}


function showSuccessMessage(data, districtSelect, mandalSelect, panchayatSelect, villageSelect, cropSelect, seasonSelect, periodSelect) {
    const msgDiv = document.getElementById('requestSuccessMsg');

    // Hide error if visible
    hideError();

    // Build summary
    const summary = `
        <i class="fas fa-check-circle"></i> 
        <strong>Request Submitted Successfully!</strong>
        <br><br>
        <div style="background: #f0fff4; padding: 10px; border-radius: 4px; margin-top: 10px;">
            <strong>Request ID:</strong> ${data.catchment_id || data.acm_id}<br>
            <strong>Location:</strong> ${getSelectedText(villageSelect)}, ${getSelectedText(panchayatSelect)}, ${getSelectedText(mandalSelect)}, ${getSelectedText(districtSelect)}<br>
            <strong>Crop:</strong> ${getSelectedText(cropSelect)}<br>
            <strong>Season:</strong> ${seasonSelect.value} ${periodSelect.value}<br>
            <strong>Status:</strong> <span style="color: #856404; font-weight: bold;">Pending Admin Approval</span>
        </div>
    `;

    msgDiv.innerHTML = summary;
    msgDiv.style.display = 'block';

    // Scroll to message
    msgDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Hide after 15 seconds
    setTimeout(() => {
        msgDiv.style.display = 'none';
    }, 15000);
}


function resetAllDropdowns() {
    // Reset location dropdowns
    const districtSelect = document.getElementById('district');
    if (districtSelect) districtSelect.selectedIndex = 0;

    resetDropdown('mandal', 'Select Mandal...');
    resetDropdown('panchayat', 'Select Panchayat...');
    resetDropdown('village', 'Select Village...');

    // Reset VO and SHG to NA
    resetToNA('vo');
    resetToNA('shg');

    // Reset crop dropdown
    const cropSelect = document.getElementById('crop');
    if (cropSelect) cropSelect.selectedIndex = 0;

    const varietySelect = document.getElementById('crop_variety');
    if (varietySelect) {
        varietySelect.innerHTML = '<option value="NA">NA - Default Variety</option>';
        varietySelect.disabled = true;
    }

    // Reset season/period
    const seasonSelect = document.getElementById('season');
    if (seasonSelect) seasonSelect.selectedIndex = 0;

    const periodSelect = document.getElementById('period');
    if (periodSelect) periodSelect.selectedIndex = 0;

    // Clear any field errors
    clearAllFieldErrors();
}

// =============================================================================
// FARMER REQUEST TAB
// =============================================================================

function getFarmerDetails() {
    const farmerId = document.getElementById('searchFarmerId').value.trim();
    const resultsDiv = document.getElementById('farmerResults');

    if (!farmerId) {
        alert("Please enter a Farmer ID");
        return;
    }

    // TODO: Replace with actual API call to fetch farmer details
    // For now, show mock data
    const mockData = {
        name: "Narayana Reddy",
        district: "Anantapur",
        mandal: "Hindupur",
        panchayat: "Kirikera",
        village: "Moda"
    };

    document.getElementById('frm_name').value = mockData.name;
    document.getElementById('frm_district').value = mockData.district;
    document.getElementById('frm_mandal').value = mockData.mandal;
    document.getElementById('frm_panchayat').value = mockData.panchayat;
    document.getElementById('frm_village').value = mockData.village;

    resultsDiv.style.display = 'block';
}


async function submitFarmerRequest() {
    const farmerId = document.getElementById('searchFarmerId').value.trim();

    if (!farmerId) {
        alert('Please search for a farmer first');
        return;
    }

    // TODO: Implement actual API call for farmer request
    alert('Farmer request submitted successfully! It is now pending admin approval.');

    // Reset form
    document.getElementById('farmerCatchmentForm').reset();
    document.getElementById('farmerResults').style.display = 'none';
}
