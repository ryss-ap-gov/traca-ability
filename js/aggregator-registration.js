/**
 * ============================================================================
 * AGGREGATOR REGISTRATION HANDLER
 * ============================================================================
 * 
 * FILE: aggregator-registration.js
 * LOCATION: js/aggregator-registration.js
 * 
 * PURPOSE:
 * Handles aggregator registration form submission with real-time validation,
 * API integration, and success display that survives page reloads.
 * 
 * UNIQUE APPROACH - RELOAD-FRIENDLY:
 * Instead of preventing page reloads (which can cause popup warnings),
 * this implementation EMBRACES the reload and works around it by:
 * 1. Saving success data to sessionStorage before reload
 * 2. Adding URL parameter (?showSuccess=true) to trigger display
 * 3. On page load, checking for the parameter
 * 4. If found, restoring and displaying success message
 * 5. Auto-closing after 10 seconds and cleaning up
 * 
 * KEY FEATURES:
 * - Real-time email and username availability checking
 * - Client-side and server-side validation
 * - Success message survives page reloads (10-second display)
 * - Form data preservation on accidental modal close
 * - NO popup warnings
 * - Clean and reliable
 * 
 * DEPENDENCIES:
 * - Backend API at http://localhost:8000
 * - sessionStorage (for success data persistence)
 * - URL parameters (for success flag)
 * 
 * ============================================================================
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Backend API base URL
 * All registration and validation endpoints are relative to this URL
 */
// const API_BASE_URL = 'http://localhost:8000';

/**
 * Timer ID for 10-second auto-close of success message
 * Used to track the setTimeout so we can log when it completes
 */
let autoCloseTimer = null;

// ============================================================================
// SUCCESS RESTORATION ON PAGE LOAD
// ============================================================================

/**
 * Main initialization - runs when DOM is fully loaded
 * 
 * DUAL PURPOSE:
 * 1. Check if page just reloaded after successful registration
 *    - If yes: Restore and display success message from sessionStorage
 * 2. Initialize normal form handlers for new registrations
 * 
 * HOW SUCCESS RESTORATION WORKS:
 * After successful registration, the page reloads with ?showSuccess=true
 * in the URL. On reload, this code:
 * - Detects the URL parameter
 * - Retrieves success data from sessionStorage
 * - Opens the modal
 * - Displays the success message
 * - Starts 10-second auto-close timer
 * - Cleans up after display
 */
document.addEventListener('DOMContentLoaded', () => {
    // ========================================================================
    // CHECK FOR SUCCESS FLAG IN URL
    // ========================================================================
    // Parse URL parameters to check if we just reloaded after success
    const urlParams = new URLSearchParams(window.location.search);
    const showSuccess = urlParams.get('showSuccess');
    
    if (showSuccess === 'true') {
        console.log('🔄 Page reloaded - restoring success message');
        
        // ====================================================================
        // RETRIEVE SUCCESS DATA FROM SESSION STORAGE
        // ====================================================================
        // Data was saved before page reload in submitAggregatorRegistration()
        const successData = JSON.parse(sessionStorage.getItem('aggRegistrationSuccess') || '{}');
        
        // Only proceed if we have valid success data with aggregator_id
        if (successData.aggregator_id) {
            // ================================================================
            // OPEN THE MODAL
            // ================================================================
            const modal = document.getElementById('aggregatorModal');
            if (modal) {
                modal.classList.add('active');
            }
            
            // ================================================================
            // GET DOM ELEMENTS
            // ================================================================
            const successDiv = document.getElementById('aggSuccessMsg');
            const form = document.getElementById('aggForm');
            
            if (successDiv && form) {
                // ============================================================
                // CREATE SUCCESS MESSAGE HTML
                // ============================================================
                // Using data from sessionStorage to recreate the exact
                // success message that would have been shown
                successDiv.innerHTML = `
                    <div class="success-content">
                        <i class="fas fa-check-circle success-icon"></i>
                        <h3>Registration Successful!</h3>
                        <p class="success-message">${successData.message}</p>
                        <div class="aggregator-id-box">
                            <p><strong>Your Aggregator ID:</strong></p>
                            <p class="aggregator-id">${successData.aggregator_id}</p>
                        </div>
                        <p><strong>Username:</strong> ${successData.username}</p>
                        <p><strong>Status:</strong> <span class="status-pending">${successData.status}</span></p>
                        <p class="success-note">
                            <i class="fas fa-info-circle"></i>
                            Please save your Aggregator ID and username. You will be notified once approved.
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
                // Ensures user sees the success message from the beginning
                const modalBody = form.closest('.modal-body');
                if (modalBody) {
                    modalBody.scrollTop = 0;
                }
                
                // ============================================================
                // AUTO-CLOSE AFTER 10 SECONDS
                // ============================================================
                setTimeout(() => {
                    // ========================================================
                    // CLEANUP - REMOVE SUCCESS DATA
                    // ========================================================
                    // Clear sessionStorage so success doesn't show again
                    sessionStorage.removeItem('aggRegistrationSuccess');
                    
                    // ========================================================
                    // CLEANUP - REMOVE URL PARAMETER
                    // ========================================================
                    // Remove ?showSuccess=true from URL for clean state
                    const url = new URL(window.location);
                    url.searchParams.delete('showSuccess');
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
                    // Reset form for next registration
                    if (form) {
                        form.style.display = 'block';
                        form.reset();
                    }
                    
                    // ========================================================
                    // CLEAR VALIDATION FEEDBACK
                    // ========================================================
                    const emailFeedback = document.getElementById('aggEmailFeedback');
                    const usernameFeedback = document.getElementById('aggUsernameFeedback');
                    if (emailFeedback) {
                        emailFeedback.innerHTML = '';
                        emailFeedback.className = 'field-feedback';
                    }
                    if (usernameFeedback) {
                        usernameFeedback.innerHTML = '';
                        usernameFeedback.className = 'field-feedback';
                    }
                    
                    console.log('✅ Success display completed');
                }, 10000); // 10000ms = 10 seconds
            }
        }
    }
    
    // ========================================================================
    // INITIALIZE NORMAL FORM HANDLERS
    // ========================================================================
    // This runs whether or not success was restored
    // Sets up handlers for email, username validation and form submission
    initializeAggregatorRegistration();
});

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate email address format
 * 
 * REGEX BREAKDOWN:
 * ^[^\s@]+  - Start with one or more non-space, non-@ characters
 * @         - Followed by @ symbol
 * [^\s@]+   - Followed by one or more non-space, non-@ characters
 * \.        - Followed by a dot
 * [^\s@]+$  - End with one or more non-space, non-@ characters
 * 
 * @param {string} email - Email address to validate
 * @returns {boolean} True if email format is valid
 */
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Validate mobile number format
 * 
 * ACCEPTS:
 * - 10 digits: 9876543210
 * - 11 digits: 09876543210
 * - 12 digits: 919876543210 (with country code)
 * - 13 digits: +919876543210
 * - Up to 15 digits for international formats
 * 
 * @param {string} mobile - Mobile number to validate
 * @returns {boolean} True if 10-15 digits
 */
function isValidMobile(mobile) {
    return /^[0-9]{10,15}$/.test(mobile);
}

/**
 * Validate password strength
 * 
 * REQUIREMENTS:
 * - Minimum: 8 characters (for security)
 * - Maximum: 72 characters (bcrypt hash limit)
 * 
 * @param {string} password - Password to validate
 * @returns {boolean} True if password meets length requirements
 */
function isValidPassword(password) {
    return password && password.length >= 8 && password.length <= 72;
}

// ============================================================================
// REAL-TIME EMAIL VALIDATION
// ============================================================================

/**
 * Timeout ID for email validation debouncing
 * Prevents excessive API calls while user is typing
 */
let emailTimeout = null;

/**
 * Handle email input with real-time availability checking
 * 
 * USER EXPERIENCE FLOW:
 * 1. User types email address
 * 2. Instantly validate format (client-side)
 * 3. If format valid, show "Checking..." state
 * 4. Wait 500ms after user stops typing (debouncing)
 * 5. Call API to check if email already registered
 * 6. Show "Available" or "Already registered" feedback
 * 
 * DEBOUNCING:
 * We don't call the API on every keystroke. Instead, we wait
 * 500ms after the user stops typing. This reduces server load
 * and provides a better user experience.
 * 
 * @param {Event} event - Input event from email field
 */
function handleEmailInput(event) {
    const email = event.target.value;
    const feedbackDiv = document.getElementById('aggEmailFeedback');
    
    // Clear any existing timeout (debouncing)
    if (emailTimeout) clearTimeout(emailTimeout);
    
    // If field is empty, clear feedback
    if (!email) {
        feedbackDiv.innerHTML = '';
        feedbackDiv.className = 'field-feedback';
        return;
    }
    
    // Check email format first (instant feedback)
    if (!isValidEmail(email)) {
        feedbackDiv.innerHTML = '<i class="fas fa-times-circle"></i> Invalid email format';
        feedbackDiv.className = 'field-feedback error';
        return;
    }
    
    // Show "Checking..." state
    feedbackDiv.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Checking...';
    feedbackDiv.className = 'field-feedback checking';
    
    // Wait 500ms after user stops typing, then check availability
    emailTimeout = setTimeout(async () => {
        try {
            // Call backend API to check if email exists in database
            const response = await fetch(`${API_BASE_URL}/api/aggregator/check-email/${encodeURIComponent(email)}`);
            const data = await response.json();
            
            // Display availability status
            if (data.available) {
                feedbackDiv.innerHTML = '<i class="fas fa-check-circle"></i> Available';
                feedbackDiv.className = 'field-feedback available';
            } else {
                feedbackDiv.innerHTML = '<i class="fas fa-times-circle"></i> Email already registered';
                feedbackDiv.className = 'field-feedback unavailable';
            }
        } catch (error) {
            // Handle network errors gracefully
            feedbackDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> Check failed';
            feedbackDiv.className = 'field-feedback error';
        }
    }, 500); // 500ms debounce delay
}

// ============================================================================
// REAL-TIME USERNAME VALIDATION
// ============================================================================

/**
 * Timeout ID for username validation debouncing
 */
let usernameTimeout = null;

/**
 * Handle username input with real-time availability checking
 * 
 * Same flow as email validation but without format checking
 * (username format requirements are less strict)
 * 
 * @param {Event} event - Input event from username field
 */
function handleUsernameInput(event) {
    const username = event.target.value;
    const feedbackDiv = document.getElementById('aggUsernameFeedback');
    
    // Clear previous timeout (debouncing)
    if (usernameTimeout) clearTimeout(usernameTimeout);
    
    // If field is empty, clear feedback
    if (!username) {
        feedbackDiv.innerHTML = '';
        feedbackDiv.className = 'field-feedback';
        return;
    }
    
    // Show checking state
    feedbackDiv.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Checking...';
    feedbackDiv.className = 'field-feedback checking';
    
    // Wait 500ms after user stops typing
    usernameTimeout = setTimeout(async () => {
        try {
            // Call backend API to check username availability
            const response = await fetch(`${API_BASE_URL}/api/aggregator/check-username/${encodeURIComponent(username)}`);
            const data = await response.json();
            
            // Display result
            if (data.available) {
                feedbackDiv.innerHTML = '<i class="fas fa-check-circle"></i> Available';
                feedbackDiv.className = 'field-feedback available';
            } else {
                feedbackDiv.innerHTML = '<i class="fas fa-times-circle"></i> Username already taken';
                feedbackDiv.className = 'field-feedback unavailable';
            }
        } catch (error) {
            feedbackDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> Check failed';
            feedbackDiv.className = 'field-feedback error';
        }
    }, 500);
}

// ============================================================================
// FORM SUBMISSION
// ============================================================================

/**
 * Handle aggregator registration form submission
 * 
 * COMPLETE FLOW:
 * 1. Prevent default form submission (no automatic page reload)
 * 2. Extract and validate all form fields
 * 3. Show loading state on submit button
 * 4. Send data to backend API via POST request
 * 5. If successful:
 *    a. Save success data to sessionStorage
 *    b. Add ?showSuccess=true to URL
 *    c. Reload page (success will be restored on load)
 * 6. If error:
 *    a. Display error message
 *    b. Keep form data so user can correct and resubmit
 * 
 * RELOAD STRATEGY:
 * On success, we intentionally reload the page with a URL parameter.
 * This might seem counter-intuitive, but it solves the problem of
 * external scripts triggering reloads. Instead of fighting it, we
 * embrace it and ensure success displays correctly after reload.
 * 
 * VALIDATIONS PERFORMED:
 * - Email format and availability (client-side format, server checks availability)
 * - Mobile number format (10-15 digits)
 * - SPOC mobile number format (10-15 digits)
 * - Password strength (8-72 characters)
 * 
 * @param {Event} event - Form submit event
 * @returns {boolean} Always returns false to prevent default submission
 */
async function submitAggregatorRegistration(event) {
    // Prevent default form submission behavior
    event.preventDefault();
    event.stopPropagation();
    
    // Get DOM elements
    const form = document.getElementById('aggForm');
    const submitButton = form.querySelector('button[type="submit"]');
    const errorDiv = document.getElementById('aggErrorMsg');
    const successDiv = document.getElementById('aggSuccessMsg');
    const modalBody = form.closest('.modal-body');
    
    // Hide any previous messages
    errorDiv.style.display = 'none';
    successDiv.style.display = 'none';
    
    // Extract form data
    const formData = new FormData(form);
    const email = formData.get('email');
    const mobile = formData.get('mobile');
    const spocMobile = formData.get('spoc_mobile');
    const username = formData.get('user_id');
    const password = formData.get('password');
    
    // ========================================================================
    // CLIENT-SIDE VALIDATION
    // ========================================================================
    // Validate before sending to server for instant feedback
    
    if (!isValidEmail(email)) {
        showError(errorDiv, 'Please enter a valid email address', modalBody);
        return false;
    }
    
    if (!isValidMobile(mobile)) {
        showError(errorDiv, 'Mobile number must be 10-15 digits', modalBody);
        return false;
    }
    
    if (!isValidMobile(spocMobile)) {
        showError(errorDiv, 'SPOC mobile number must be 10-15 digits', modalBody);
        return false;
    }
    
    if (!isValidPassword(password)) {
        showError(errorDiv, 'Password must be 8-72 characters long', modalBody);
        return false;
    }
    
    // ========================================================================
    // SHOW LOADING STATE
    // ========================================================================
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
    
    try {
        // ====================================================================
        // SEND TO BACKEND API
        // ====================================================================
        const response = await fetch(`${API_BASE_URL}/api/aggregator/register`, {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // ================================================================
            // SUCCESS - SAVE AND RELOAD
            // ================================================================
            
            // Save success data to sessionStorage
            // This persists across the page reload
            sessionStorage.setItem('aggRegistrationSuccess', JSON.stringify(data));
            
            // Add URL parameter to trigger success display on reload
            const url = new URL(window.location);
            url.searchParams.set('showSuccess', 'true');
            
            // Reload page - success will be restored and displayed
            // Note: This is intentional! We embrace the reload instead
            // of fighting it. The DOMContentLoaded handler above will
            // detect the URL parameter and restore the success message.
            window.location.href = url.toString();
            
            // Code after this line won't execute because page is reloading
            
        } else {
            // ================================================================
            // ERROR FROM API
            // ================================================================
            showError(errorDiv, data.detail || 'Registration failed. Please try again.', modalBody);
        }
        
    } catch (error) {
        // ====================================================================
        // NETWORK ERROR
        // ====================================================================
        showError(errorDiv, 'Network error. Please check your connection and try again.', modalBody);
    } finally {
        // ====================================================================
        // RESET BUTTON STATE
        // ====================================================================
        // This runs even if there was an error
        // Note: Won't execute on success because page reloads
        submitButton.disabled = false;
        submitButton.innerHTML = '<i class="fas fa-paper-plane"></i> Submit for Approval';
    }
    
    return false;
}

// ============================================================================
// ERROR DISPLAY
// ============================================================================

/**
 * Display error message in modal
 * 
 * BEHAVIOR:
 * - Shows error at top of modal
 * - Scrolls to ensure visibility
 * - Error stays visible until dismissed
 * - Form data is preserved (user can fix and resubmit)
 * 
 * @param {HTMLElement} errorDiv - Error message container
 * @param {string} message - Error message to display
 * @param {HTMLElement} modalBody - Modal body for scrolling
 */
function showError(errorDiv, message, modalBody) {
    // Create error HTML
    errorDiv.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <strong>Error:</strong> ${message}
    `;
    errorDiv.style.display = 'block';
    
    // Scroll modal to top so user sees the error
    if (modalBody) {
        modalBody.scrollTop = 0;
    }
    
    // Smooth scroll error into view
    errorDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ============================================================================
// MODAL CLOSE WITH SMART RESET
// ============================================================================

/**
 * Close aggregator modal with intelligent form reset logic
 * 
 * SMART RESET LOGIC:
 * - If URL has ?showSuccess=true → User just registered → Reset form
 * - If URL doesn't have parameter → Accidental close → Preserve data
 * 
 * This allows users to accidentally close the modal while filling
 * the form and reopen it with their data intact. But after successful
 * registration, the form is reset for the next user.
 * 
 * CLEANUP ON SUCCESS:
 * - Removes ?showSuccess=true from URL
 * - Clears success data from sessionStorage
 * - Resets form and feedback messages
 */
function closeModalAndReset() {
    const form = document.getElementById('aggForm');
    const successDiv = document.getElementById('aggSuccessMsg');
    const errorDiv = document.getElementById('aggErrorMsg');
    const modal = document.getElementById('aggregatorModal');
    
    // Check if we're closing after a successful registration
    const urlParams = new URLSearchParams(window.location.search);
    const wasSuccess = urlParams.get('showSuccess') === 'true';
    
    // Hide messages
    if (successDiv) successDiv.style.display = 'none';
    if (errorDiv) errorDiv.style.display = 'none';
    
    if (wasSuccess) {
        // ====================================================================
        // CLOSING AFTER SUCCESS - RESET FORM
        // ====================================================================
        if (form) {
            form.style.display = 'block';
            form.reset();
        }
        
        // Clear validation feedback
        const emailFeedback = document.getElementById('aggEmailFeedback');
        const usernameFeedback = document.getElementById('aggUsernameFeedback');
        if (emailFeedback) {
            emailFeedback.innerHTML = '';
            emailFeedback.className = 'field-feedback';
        }
        if (usernameFeedback) {
            usernameFeedback.innerHTML = '';
            usernameFeedback.className = 'field-feedback';
        }
        
        // Clean URL (remove ?showSuccess=true)
        const url = new URL(window.location);
        url.searchParams.delete('showSuccess');
        window.history.replaceState({}, '', url);
        
        // Clean sessionStorage
        sessionStorage.removeItem('aggRegistrationSuccess');
    } else {
        // ====================================================================
        // ACCIDENTAL CLOSE - PRESERVE FORM DATA
        // ====================================================================
        // Just show the form again, don't reset it
        if (form) {
            form.style.display = 'block';
        }
    }
    
    // Close the modal
    if (modal) {
        modal.classList.remove('active');
    }
}

// ============================================================================
// GLOBAL FUNCTION OVERRIDES
// ============================================================================

/**
 * Store reference to original closeModal function
 * This may be defined in apcnf.js or login.js
 */
const originalCloseModal = window.closeModal;

/**
 * Override global closeModal function
 * 
 * PURPOSE:
 * Ensures our smart reset logic runs for the aggregator modal,
 * while preserving original behavior for other modals (buyer, login)
 * 
 * @param {string} modalId - ID of modal to close
 */
window.closeModal = function(modalId) {
    if (modalId === 'aggregatorModal') {
        // Use our custom close logic for aggregator modal
        closeModalAndReset();
        return;
    }
    
    // For other modals, use original function
    if (originalCloseModal) {
        originalCloseModal(modalId);
    } else {
        // Fallback if no original function exists
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
        }
    }
};

/**
 * Make closeAggregatorModal available globally
 * Allows HTML onclick handlers to call it directly
 */
window.closeAggregatorModal = closeModalAndReset;

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize aggregator registration handlers
 * 
 * SETUP:
 * - Attaches form submit handler
 * - Attaches email input handler for real-time validation
 * - Attaches username input handler for real-time validation
 * - Logs initialization status
 * 
 * This function is called from the DOMContentLoaded listener above
 */
function initializeAggregatorRegistration() {
    const aggForm = document.getElementById('aggForm');
    const aggEmail = document.getElementById('aggEmail');
    const aggUsername = document.getElementById('aggUserId');
    
    // Attach form submission handler
    if (aggForm) {
        aggForm.addEventListener('submit', submitAggregatorRegistration);
        console.log('✅ Aggregator form handler attached');
    }
    
    // Attach email input handler
    if (aggEmail) {
        aggEmail.addEventListener('input', handleEmailInput);
    }
    
    // Attach username input handler
    if (aggUsername) {
        aggUsername.addEventListener('input', handleUsernameInput);
    }
    
    // Log successful initialization
    console.log('🚀 Aggregator registration initialized (RELOAD-FRIENDLY)');
    console.log('💾 Form data preservation: ENABLED');
    console.log('🔄 Success survives page reload: YES');
}

/**
 * ============================================================================
 * APPROACH SUMMARY
 * ============================================================================
 * 
 * WHY THIS APPROACH WORKS:
 * Instead of fighting page reloads (which can trigger popup warnings),
 * we embrace the reload and use it to our advantage.
 * 
 * COMPLETE FLOW:
 * 1. User fills form and submits
 * 2. API returns success with aggregator_id
 * 3. Save success data to sessionStorage
 * 4. Add ?showSuccess=true to URL
 * 5. Reload page
 * 6. On load, DOMContentLoaded handler checks for ?showSuccess=true
 * 7. If found, retrieves data from sessionStorage
 * 8. Opens modal and displays success message
 * 9. Starts 10-second auto-close timer
 * 10. After 10 seconds, cleans up and resets
 * 
 * BENEFITS:
 * ✅ No "Reload site?" popup (we don't prevent reload)
 * ✅ Success ALWAYS shows for 10 seconds (survives reload)
 * ✅ Works even if external scripts trigger reloads
 * ✅ Form data preserved on accidental close
 * ✅ Clean, simple, and reliable
 * 
 * TRADE-OFFS:
 * ⚠️ Page reloads on success (but happens so fast user barely notices)
 * ⚠️ Slight delay during reload (negligible on modern connections)
 * 
 * ============================================================================
 */