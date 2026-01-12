/**
 * ============================================================================
 * APCNF – CORE UI & GLOBAL CONFIGURATION
 * ============================================================================
 *
 * THIS FILE IS RESPONSIBLE FOR:
 * ----------------------------
 * 1. Global configuration (API base URL)
 * 2. Generic modal open / close helpers
 * 3. Conditional document field toggling (Org Type based)
 * 4. Password visibility toggle
 * 5. Header scroll behavior
 * 6. Leaflet map initialization (Home page)
 *
 * THIS FILE MUST NOT:
 * -------------------
 * ❌ Handle Buyer Registration submission
 * ❌ Handle Aggregator Registration submission
 * ❌ Reset Buyer / Aggregator forms unconditionally
 * ❌ Control success lifecycle of registration modals
 *
 * Buyer & Aggregator registrations are SELF-MANAGED in:
 * - aggregator-registration.js
 * - buyer-registration.js
 *
 * ============================================================================
 */


/**
 * ============================================================================
 * GLOBAL CONFIGURATION (VERY IMPORTANT)
 * ============================================================================
 *
 * API_BASE_URL MUST be declared ONLY ONCE in the entire project.
 * It is shared by:
 * - aggregator-registration.js
 * - buyer-registration.js
 * - login.js (if needed)
 *
 * ❌ DO NOT redeclare this constant in any other JS file
 * ============================================================================
 */
window.API_BASE_URL = 'http://localhost:8000';


/**
 * ============================================================================
 * GENERIC MODAL HELPERS
 * ============================================================================
 * These helpers are SAFE ONLY for:
 * - Opening modals
 * - Closing NON-REGISTRATION modals
 *
 * ⚠️ Buyer & Aggregator registration modals have
 * their OWN lifecycle logic and MUST NOT be reset here.
 * ============================================================================
 */

/**
 * Open any modal by ID
 */
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.add('active');
}

/**
 * Close modal GENERICALLY.
 *
 * ⚠️ IMPORTANT SAFETY RULE:
 * -------------------------
 * Buyer and Aggregator registration modals must NOT
 * be force-reset here.
 *
 * Their reset logic is handled in:
 * - closeBuyerModalAndReset()
 * - closeAggregatorModal()
 */
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    // 🚫 Do NOT interfere with registration modals
    if (modalId === 'buyerModal' || modalId === 'aggregatorModal') {
        modal.classList.remove('active');
        return;
    }

    modal.classList.remove('active');

    // Hide success message if present (generic modals only)
    const successMsg = modal.querySelector('.alert-success');
    if (successMsg) {
        successMsg.style.display = 'none';
    }

    // Reset generic modal forms ONLY
    const form = modal.querySelector('form');
    if (form) {
        form.reset();
        form.style.display = 'block';
    }
}


/**
 * ============================================================================
 * BACKDROP CLICK HANDLER
 * ============================================================================
 * Allows closing modals when clicking outside content.
 *
 * ⚠️ Buyer & Aggregator modals are EXCLUDED deliberately.
 * ============================================================================
 */
window.onclick = function (event) {
    if (!event.target.classList.contains('modal')) return;

    const modalId = event.target.id;

    // 🚫 NEVER auto-close Buyer / Aggregator registration modals
    if (modalId === 'buyerModal' || modalId === 'aggregatorModal') return;

    closeModal(modalId);
};


/**
 * ============================================================================
 * CONDITIONAL DOCUMENT FIELD LOGIC
 * ============================================================================
 * Toggles required documents based on Organisation Type.
 *
 * Used by BOTH:
 * - Aggregator registration
 * - Buyer registration
 * ============================================================================
 */
function toggleDocumentFields(type) {
    const orgTypeSelect = document.getElementById(type + 'OrgType');
    if (!orgTypeSelect) return;

    const orgType = orgTypeSelect.value;

    const isInstitution = (orgType === 'FPO' || orgType === 'MS' || orgType === 'VO' || orgType === 'BRC');
    const isIndividual = (orgType === 'Individual' || orgType === 'Entrepreneur');

    const updateField = (label, input, isRequired) => {
        if (!label || !input) return;

        const baseText = label.textContent.replace(' *', '');
        if (isRequired) {
            label.innerHTML = baseText + ' <span class="required">*</span>';
            input.required = true;
        } else {
            label.innerHTML = baseText;
            input.required = false;
        }
    };

    updateField(
        document.getElementById(type + 'RegLabel'),
        document.getElementById(type + 'RegUpload'),
        isInstitution
    );

    updateField(
        document.getElementById(type + 'PanLabel'),
        document.getElementById(type + 'PanUpload'),
        isInstitution
    );

    updateField(
        document.getElementById(type + 'AadharLabel'),
        document.getElementById(type + 'AadharUpload'),
        isIndividual
    );
}


/**
 * ============================================================================
 * INITIAL FIELD STATE ON PAGE LOAD
 * ============================================================================
 */
document.addEventListener('DOMContentLoaded', () => {
    toggleDocumentFields('agg');
    toggleDocumentFields('buyer');
});


/**
 * ============================================================================
 * PASSWORD VISIBILITY TOGGLE
 * ============================================================================
 */
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;

    const icon = input.nextElementSibling;

    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}


/**
 * ============================================================================
 * HEADER SCROLL EFFECT
 * ============================================================================
 */
window.onscroll = function () {
    const header = document.getElementById('mainHeader');
    if (!header) return;

    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
};


/**
 * ============================================================================
 * LEAFLET MAP INITIALIZATION (HOME PAGE ONLY)
 * ============================================================================
 */
try {
    if (document.getElementById('map')) {
        const map = L.map('map').setView([15.9129, 79.7400], 7);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        // Demo markers
        L.marker([17.6868, 83.2185]).addTo(map).bindPopup('Farmer Location 1');
        L.marker([16.5062, 80.6480]).addTo(map).bindPopup('Farmer Location 2');
        L.marker([14.4673, 78.8242]).addTo(map).bindPopup('Farmer Location 3');
    }
} catch (e) {
    console.error('Leaflet map initialization failed:', e);
}
