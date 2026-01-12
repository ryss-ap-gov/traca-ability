/**
 * ============================================================================
 * BUYER REGISTRATION HANDLER - PERFECT VERSION
 * ============================================================================
 * 
 * MATCHES AGGREGATOR ARCHITECTURE 100%
 * 
 * FEATURES:
 * - Real-time email validation
 * - Real-time username validation
 * - Console logging for debugging
 * - Success message with page reload
 * - Form preservation
 * - 10-second auto-close
 * 
 * ============================================================================
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Debounce timers for real-time validation
 */
let buyerEmailTimeout = null;
let buyerUsernameTimeout = null;

/**
 * Timer for 10-second auto-close
 */
let buyerAutoCloseTimer = null;

// ============================================================================
// SUCCESS RESTORATION ON PAGE LOAD
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    // ========================================================================
    // CHECK FOR SUCCESS FLAG IN URL
    // ========================================================================
    const urlParams = new URLSearchParams(window.location.search);
    const showSuccess = urlParams.get('showBuyerSuccess');
    
    if (showSuccess === 'true') {
        console.log('🔄 Page reloaded - restoring buyer success message');
        
        // ====================================================================
        // RETRIEVE SUCCESS DATA FROM SESSION STORAGE
        // ====================================================================
        const successData = JSON.parse(sessionStorage.getItem('buyerRegistrationSuccess') || '{}');
        
        // ✅ CRITICAL: Check for buyer_id at ROOT level (like aggregator checks aggregator_id)
        if (successData.buyer_id) {
            // ================================================================
            // OPEN THE MODAL
            // ================================================================
            const modal = document.getElementById('buyerModal');
            if (modal) {
                modal.classList.add('active');
            }
            
            // ================================================================
            // GET DOM ELEMENTS
            // ================================================================
            const successDiv = document.getElementById('buyerSuccessMsg');
            const form = document.getElementById('buyerForm');
            
            if (successDiv && form) {
                // ============================================================
                // CREATE SUCCESS MESSAGE HTML
                // ============================================================
                successDiv.innerHTML = `
                    <div class="success-content">
                        <i class="fas fa-check-circle success-icon"></i>
                        <h3>Registration Successful!</h3>
                        <p class="success-message">${successData.message}</p>
                        <div class="aggregator-id-box">
                            <p><strong>Your Buyer ID:</strong></p>
                            <p class="aggregator-id">${successData.buyer_id}</p>
                        </div>
                        <p><strong>Username:</strong> ${successData.username}</p>
                        <p><strong>Status:</strong> <span class="status-pending">${successData.status}</span></p>
                        <p class="success-note">
                            <i class="fas fa-info-circle"></i>
                            Please save your Buyer ID and username. You will be notified once approved.
                        </p>
                        <p style="text-align: center; margin-top: 1rem; color: #666; font-size: 0.9rem;">
                            <em>This window will close in 10 seconds</em>
                        </p>
                    </div>
                `;
                
                // ============================================================
                // SHOW SUCCESS, HIDE FORM
                // ============================================================
                successDiv.style.display = 'block';
                form.style.display = 'none';
                
                // ============================================================
                // SCROLL TO TOP OF MODAL
                // ============================================================
                const modalBody = form.closest('.modal-body');
                if (modalBody) {
                    modalBody.scrollTop = 0;
                }
                
                // ============================================================
                // AUTO-CLOSE AFTER 10 SECONDS
                // ============================================================
                buyerAutoCloseTimer = setTimeout(() => {
                    // ========================================================
                    // CLEANUP - REMOVE SUCCESS DATA
                    // ========================================================
                    sessionStorage.removeItem('buyerRegistrationSuccess');
                    
                    // ========================================================
                    // CLEANUP - REMOVE URL PARAMETER
                    // ========================================================
                    const url = new URL(window.location);
                    url.searchParams.delete('showBuyerSuccess');
                    window.history.replaceState({}, '', url);
                    
                    // ========================================================
                    // CLOSE MODAL
                    // ========================================================
                    if (modal) {
                        modal.classList.remove('active');
                    }
                    
                    // ========================================================
                    // HIDE SUCCESS MESSAGE
                    // ========================================================
                    if (successDiv) {
                        successDiv.style.display = 'none';
                    }
                    
                    // ========================================================
                    // SHOW AND RESET FORM
                    // ========================================================
                    if (form) {
                        form.style.display = 'block';
                        form.reset();
                    }
                    
                    // Clear feedback indicators
                    const emailFeedback = document.getElementById('buyerEmailFeedback');
                    const usernameFeedback = document.getElementById('buyerUsernameFeedback');
                    if (emailFeedback) {
                        emailFeedback.innerHTML = '';
                        emailFeedback.className = 'field-feedback';
                    }
                    if (usernameFeedback) {
                        usernameFeedback.innerHTML = '';
                        usernameFeedback.className = 'field-feedback';
                    }
                    
                    console.log('✅ Buyer success display completed');
                }, 10000);
            }
        }
    }
    
    initializeBuyerRegistration();
});

// ============================================================================
// FORM SUBMISSION
// ============================================================================

async function submitBuyerRegistration(event) {
    event.preventDefault();
    event.stopPropagation();
    
    const form = document.getElementById('buyerForm');
    const submitBtn = form.querySelector('button[type="submit"]');
    const errorDiv = document.getElementById('buyerErrorMsg');
    const successDiv = document.getElementById('buyerSuccessMsg');
    const modalBody = form.closest('.modal-body');
    
    // Hide messages
    errorDiv.style.display = 'none';
    successDiv.style.display = 'none';
    
    const formData = new FormData(form);
    const email = formData.get('buyer_org_email');
    const mobile = formData.get('buyer_org_mobile');
    const phone = formData.get('buyer_org_phone');
    const spocMobile = formData.get('buyer_org_spoc_mobile');
    const username = formData.get('buyer_org_user_id');
    const password = formData.get('buyer_org_user_id_password');
    
    // ========================================================================
    // CLIENT-SIDE VALIDATION
    // ========================================================================
    
    if (!buyerIsValidEmail(email)) {
        buyerShowError(errorDiv, 'Please enter a valid email address', modalBody);
        return false;
    }
    
    if (!buyerIsValidMobile(mobile)) {
        buyerShowError(errorDiv, 'Mobile number must be 10-15 digits', modalBody);
        return false;
    }
    
    if (phone && !buyerIsValidMobile(phone)) {
        buyerShowError(errorDiv, 'Phone number must be 10-15 digits', modalBody);
        return false;
    }
    
    if (!buyerIsValidMobile(spocMobile)) {
        buyerShowError(errorDiv, 'SPOC mobile number must be 10-15 digits', modalBody);
        return false;
    }
    
    if (!buyerIsValidPassword(password)) {
        buyerShowError(errorDiv, 'Password must be 8-72 characters long', modalBody);
        return false;
    }
    
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
    
    try {
        // ✅ CRITICAL FIX: Use window.API_BASE_URL
        const response = await fetch(`${window.API_BASE_URL}/api/buyer/register`, {
            method: 'POST',
            body: formData
        });
        
        let data = null;
        
        try {
            data = await response.json();
        } catch (e) {
            data = {};
        }
        
        if (!response.ok) {
            throw new Error(data?.detail || data?.message || 'Buyer registration failed');
        }
        
        console.log('✅ Backend response:', data);
        
        /**
         * ================================================================
         * ✅ CRITICAL FIX: FLATTEN DATA STRUCTURE (MATCH AGGREGATOR)
         * ================================================================
         * Backend returns: { success, message, data: { buyer_id, ... } }
         * We flatten to: { message, buyer_id, username, status }
         * ================================================================
         */
        const successData = {
            message: data?.message || 'Buyer registration submitted successfully. Admin will review your application.',
            buyer_id: data?.data?.buyer_id || data?.buyer_id || 'Generated',
            username: data?.data?.username || data?.username || username,
            status: data?.data?.status || data?.status || 'Pending Approval'
        };
        
        console.log('💾 Saving buyer success data:', successData);
        
        // Save to sessionStorage
        sessionStorage.setItem('buyerRegistrationSuccess', JSON.stringify(successData));
        
        // Verify save
        const verify = sessionStorage.getItem('buyerRegistrationSuccess');
        console.log('🔍 Verify save:', verify ? 'SUCCESS' : 'FAILED');
        
        // Build URL with parameter
        const url = new URL(window.location);
        url.searchParams.set('showBuyerSuccess', 'true');
        const newUrl = url.toString();
        
        console.log('🔄 Reloading to:', newUrl);
        
        // Reload page
        window.location.href = newUrl;
        
    } catch (err) {
        console.error('❌ Buyer registration error:', err);
        buyerShowError(errorDiv, err.message, modalBody);
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit for Approval';
    }
    
    return false;
}

// ============================================================================
// REAL-TIME EMAIL VALIDATION
// ============================================================================

async function buyerHandleEmailInput(event) {
    const email = event.target.value.trim();
    const feedback = document.getElementById('buyerEmailFeedback');
    
    if (!feedback) return;
    
    // Clear previous timeout
    if (buyerEmailTimeout) {
        clearTimeout(buyerEmailTimeout);
    }
    
    // Reset feedback
    feedback.innerHTML = '';
    feedback.className = 'field-feedback';
    
    // Don't validate if empty
    if (!email) return;
    
    // Check basic email format first
    if (!buyerIsValidEmail(email)) {
        feedback.innerHTML = '<i class="fas fa-times-circle"></i> Invalid email format';
        feedback.className = 'field-feedback error';
        return;
    }
    
    // Show checking indicator
    feedback.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Checking...';
    feedback.className = 'field-feedback checking';
    
    // Debounce: Wait 500ms after user stops typing
    buyerEmailTimeout = setTimeout(async () => {
        try {
            const response = await fetch(`${window.API_BASE_URL}/api/buyer/check-email/${encodeURIComponent(email)}`);
            const data = await response.json();
            
            if (data.available) {
                feedback.innerHTML = '<i class="fas fa-check-circle"></i> Email available';
                feedback.className = 'field-feedback success';
            } else {
                feedback.innerHTML = '<i class="fas fa-times-circle"></i> Email already registered';
                feedback.className = 'field-feedback error';
            }
        } catch (error) {
            console.error('Email check failed:', error);
            feedback.innerHTML = '';
            feedback.className = 'field-feedback';
        }
    }, 500);
}

// ============================================================================
// REAL-TIME USERNAME VALIDATION
// ============================================================================

async function buyerHandleUsernameInput(event) {
    const username = event.target.value.trim();
    const feedback = document.getElementById('buyerUsernameFeedback');
    
    if (!feedback) return;
    
    // Clear previous timeout
    if (buyerUsernameTimeout) {
        clearTimeout(buyerUsernameTimeout);
    }
    
    // Reset feedback
    feedback.innerHTML = '';
    feedback.className = 'field-feedback';
    
    // Don't validate if empty or too short
    if (!username || username.length < 3) return;
    
    // Show checking indicator
    feedback.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Checking...';
    feedback.className = 'field-feedback checking';
    
    // Debounce: Wait 500ms after user stops typing
    buyerUsernameTimeout = setTimeout(async () => {
        try {
            const response = await fetch(`${window.API_BASE_URL}/api/buyer/check-username/${encodeURIComponent(username)}`);
            const data = await response.json();
            
            if (data.available) {
                feedback.innerHTML = '<i class="fas fa-check-circle"></i> Username available';
                feedback.className = 'field-feedback success';
            } else {
                feedback.innerHTML = '<i class="fas fa-times-circle"></i> Username already taken';
                feedback.className = 'field-feedback error';
            }
        } catch (error) {
            console.error('Username check failed:', error);
            feedback.innerHTML = '';
            feedback.className = 'field-feedback';
        }
    }, 500);
}

// ============================================================================
// MODAL CLOSE HANDLING
// ============================================================================

function closeBuyerModalAndReset() {
    const form = document.getElementById('buyerForm');
    const successDiv = document.getElementById('buyerSuccessMsg');
    const errorDiv = document.getElementById('buyerErrorMsg');
    const modal = document.getElementById('buyerModal');
    
    const urlParams = new URLSearchParams(window.location.search);
    const wasSuccess = urlParams.get('showBuyerSuccess') === 'true';
    
    // Hide messages
    if (successDiv) successDiv.style.display = 'none';
    if (errorDiv) errorDiv.style.display = 'none';
    
    if (wasSuccess) {
        // After success - reset form
        if (form) {
            form.style.display = 'block';
            form.reset();
        }
        
        // Clear feedback
        const emailFeedback = document.getElementById('buyerEmailFeedback');
        const usernameFeedback = document.getElementById('buyerUsernameFeedback');
        if (emailFeedback) {
            emailFeedback.innerHTML = '';
            emailFeedback.className = 'field-feedback';
        }
        if (usernameFeedback) {
            usernameFeedback.innerHTML = '';
            usernameFeedback.className = 'field-feedback';
        }
        
        // Clean URL
        const url = new URL(window.location);
        url.searchParams.delete('showBuyerSuccess');
        window.history.replaceState({}, '', url);
        
        // Clean sessionStorage
        sessionStorage.removeItem('buyerRegistrationSuccess');
    } else {
        // Accidental close - preserve form
        if (form) {
            form.style.display = 'block';
        }
    }
    
    // Close modal
    if (modal) {
        modal.classList.remove('active');
    }
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

function buyerIsValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function buyerIsValidMobile(mobile) {
    return /^[0-9]{10,15}$/.test(mobile);
}

function buyerIsValidPassword(password) {
    return password && password.length >= 8 && password.length <= 72;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function buyerShowError(errorDiv, message, modalBody) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    
    if (modalBody) {
        modalBody.scrollTop = 0;
    }
}

// ============================================================================
// GLOBAL FUNCTION SETUP
// ============================================================================

window.closeBuyerModal = closeBuyerModalAndReset;

// ============================================================================
// INITIALIZATION
// ============================================================================

function initializeBuyerRegistration() {
    const buyerForm = document.getElementById('buyerForm');
    const buyerEmail = document.getElementById('buyerEmail');
    const buyerUsername = document.getElementById('buyerUserId');
    
    // Attach form submission handler
    if (buyerForm) {
        buyerForm.addEventListener('submit', submitBuyerRegistration);
        console.log('✅ Buyer form handler attached');
    }
    
    // Attach email input handler
    if (buyerEmail) {
        buyerEmail.addEventListener('input', buyerHandleEmailInput);
    }
    
    // Attach username input handler
    if (buyerUsername) {
        buyerUsername.addEventListener('input', buyerHandleUsernameInput);
    }
    
    console.log('🚀 Buyer registration initialized (RELOAD-FRIENDLY)');
    console.log('💾 Form data preservation: ENABLED');
    console.log('🔄 Success survives page reload: YES');
    console.log('✨ Real-time validation: ENABLED');
}