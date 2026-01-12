document.addEventListener("DOMContentLoaded", () => {

    // --- Element Selections ---
    const batchListTbody = document.getElementById("batchListTbody");
    const noBatchesRow = document.getElementById("noBatchesRow");
    const qrModal = document.getElementById("qrModal");
    const qrModalTitle = document.getElementById("qrModalTitle");
    const qrCodeContainer = document.getElementById("qrCodeContainer");
    const closeButton = document.querySelector("#qrModal .close-btn");

    // --- Utility Function (for security) ---
    /**
     * Escapes HTML to prevent XSS attacks.
     * @param {string} str The string to escape.
     * @returns {string} The escaped string.
     */
    function escapeHTML(str) {
        if (!str) return ""; // Handle null or undefined
        return str.replace(/[&<>"']/g, function (m) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;'
            }[m];
        });
    }

    // --- Modal Functions ---

    /**
     * Closes the QR code modal.
     */
    function closeQrModal() {
        qrModal.style.display = "none";
        qrCodeContainer.innerHTML = ""; // Clear the QR code
    }

    // Make closeQrModal globally accessible for the HTML onclick=""
    window.closeQrModal = closeQrModal;

    // Add event listeners for closing the modal
    closeButton.addEventListener("click", closeQrModal);
    qrModal.addEventListener("click", (e) => {
        // Close if user clicks on the dark background
        if (e.target === qrModal) {
            closeQrModal();
        }
    });

    // --- QR Code Generation ---

    /**
     * Generates and displays a QR code for a specific batch.
     * @param {object} batch The batch data object.
     */
    function generateQrCode(batch) {
        qrModalTitle.textContent = `QR Code for: ${escapeHTML(batch.batchName)}`;
        qrCodeContainer.innerHTML = ""; // Clear previous QR code

        // Calculate total quantity for the QR data
        const totalQuantity = batch.farmerSources.reduce((sum, source) => sum + (source.quantity || 0), 0);

        // Create a public-friendly data object for the QR code
        const traceabilityData = {
            batchId: batch.batchId,
            batchName: batch.batchName,
            crop: batch.cropName,
            variety: batch.cropVariety,
            procurementDate: batch.procurementDate,
            aggregator: batch.aggregatorName,
            totalQuantity: totalQuantity.toFixed(2) + " kgs",
            // Map farmer data
            farmers: batch.farmerSources.map(f => ({
                farmerId: f.farmerId, // The ID itself
                quantity: f.quantity,
                consent: f.consent
            }))
        };

        // Stringify the data to be embedded in the QR code
        const dataString = JSON.stringify(traceabilityData);

        // Generate the QR code
        new QRCode(qrCodeContainer, {
            text: dataString,
            width: 220, // Size of the QR code
            height: 220,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.M // Medium correction level
        });

        // Show the modal
        qrModal.style.display = "block";
    }

    // --- NEW: Action Button Functions ---

    /**
     * Placeholder for editing a batch.
     * In a real app, this would redirect to the dashboard with the form pre-filled.
     * @param {string} batchId The ID of the batch to edit.
     */
    function editBatch(batchId) {
        console.log(`Editing batch: ${batchId}`);
        // You could redirect to the creation page with a query parameter:
        // window.location.href = `dashboard.html?edit=${batchId}`;
        alert(`Editing batch: ${batchId}\n(This would normally redirect to the edit form.)`);
    }

    /**
     * Deletes a batch from sessionStorage and the table.
     * @param {string} batchId The ID of the batch to cancel.
     * @param {HTMLElement} rowElement The table row element to remove.
     */
    function cancelBatch(batchId, rowElement) {
        console.log(`Cancelling batch: ${batchId}`);

        // 1. Confirm with the user
        if (!confirm(`Are you sure you want to cancel batch B...${batchId.slice(-6)}? This action cannot be undone.`)) {
            return; // User clicked "Cancel"
        }

        // 2. Get current batches from sessionStorage
        const batchesData = sessionStorage.getItem("myBatches");
        let batches = JSON.parse(batchesData) || [];

        // 3. Filter out the batch to be deleted
        batches = batches.filter(batch => batch.batchId !== batchId);

        // 4. Save the updated array back to sessionStorage
        sessionStorage.setItem("myBatches", JSON.stringify(batches));

        // 5. Remove the row from the table
        rowElement.remove();

        // 6. Check if the table is now empty
        if (batches.length === 0 && noBatchesRow) {
            noBatchesRow.style.display = "table-row";
        }

        alert(`Batch B...${batchId.slice(-6)} has been cancelled.`);
    }

    // --- Main Function: Load Batches into Table ---

    function loadBatches() {
        // 1. Get data from sessionStorage
        const batchesData = sessionStorage.getItem("myBatches");
        const batches = JSON.parse(batchesData) || [];

        // 2. Check if any batches exist
        if (batches.length === 0) {
            // Show the "no batches" row
            if (noBatchesRow) {
                noBatchesRow.style.display = "table-row";
            }
        } else {
            // Hide the "no batches" row
            if (noBatchesRow) {
                noBatchesRow.style.display = "none";
            }

            // Clear the table body
            batchListTbody.innerHTML = "";

            // 3. Loop through batches and create rows
            batches.forEach(batch => {
                // Calculate total quantity from all farmer sources
                const totalQuantity = batch.farmerSources.reduce((sum, source) => sum + (source.quantity || 0), 0);

                const tr = document.createElement("tr");
                tr.setAttribute("data-batch-id", batch.batchId);

                // --- CHANGE 1: Column Fix ---
                // Removed the "batchName" <td> to match the 6-column HTML header.
                //
                // --- CHANGE 2: Added Buttons ---
                // Added "Edit" and "Cancel" buttons to the actions <td>.
                // Added "actions-cell" class for styling (as recommended in HTML).
                tr.innerHTML = `
                    <td>B...${escapeHTML(batch.batchId.slice(-6))}</td>
                    <td>${escapeHTML(batch.cropName)}</td>
                    <td>${escapeHTML(batch.cropVariety)}</td>
                    <td>${totalQuantity.toFixed(2)}</td>
                    <td>${escapeHTML(batch.procurementDate)}</td>
                    <td class="actions-cell">
                        <button class="btn btn-small btn-primary qr-btn" title="Generate QR Code">
                            <i class="fa-solid fa-qrcode"></i>
                        </button>
                        <button class="btn btn-small btn-success trace-btn" title="View Traceability">
                            <i class="fa-solid fa-route"></i>
                        </button>
                        <button class="btn btn-small btn-secondary edit-btn" title="Edit Batch">
                            <i class="fa-solid fa-pencil"></i>
                        </button>
                        <button class="btn btn-small btn-danger cancel-btn" title="Cancel Batch">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </td>
                `;

                // --- CHANGE 3: Added Event Listeners ---
                // Add event listener for the QR button
                tr.querySelector(".qr-btn").addEventListener("click", () => {
                    generateQrCode(batch);
                });

                // Add event listener for the Traceability button
                tr.querySelector(".trace-btn").addEventListener("click", () => {
                    // Store batch data for traceability page
                    localStorage.setItem('currentBatch', JSON.stringify(batch));
                    // Navigate to traceability page with batch ID
                    window.location.href = `traceability.html?batchId=${encodeURIComponent(batch.batchId)}`;
                });

                // Add event listener for the Edit button
                tr.querySelector(".edit-btn").addEventListener("click", () => {
                    editBatch(batch.batchId);
                });

                // Add event listener for the Cancel button
                tr.querySelector(".cancel-btn").addEventListener("click", () => {
                    cancelBatch(batch.batchId, tr); // Pass the row element
                });

                // 4. Append the new row to the table
                batchListTbody.appendChild(tr);
            });
        }
    }

    // --- Initial Execution ---
    // Load the batches as soon as the DOM is ready
    loadBatches();
});