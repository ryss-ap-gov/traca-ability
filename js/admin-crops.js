// This is js/admin-crops.js
document.addEventListener('DOMContentLoaded', () => {

    const addCropForm = document.getElementById('add-crop-form');
    const cropTableBody = document.querySelector('#crop-master-table tbody');

    if (addCropForm) {
        addCropForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Get values from form
            const cropName = document.getElementById('cropName').value;
            const cropId = document.getElementById('cropId').value;
            const varietyName = document.getElementById('varietyName').value;
            const varietyId = document.getElementById('varietyId').value;

            // Create new table row
            const newRow = document.createElement('tr');
            newRow.innerHTML = `
                <td>${cropName.toUpperCase()}</td>
                <td>${cropId}</td>
                <td>${varietyName.toUpperCase()}</td>
                <td>${varietyId}</td>
                <td><button class="btn btn-small btn-danger remove-btn"><i class="fa-solid fa-trash"></i></button></td>
            `;

            // Add new row to table
            if (cropTableBody) {
                cropTableBody.appendChild(newRow);
            }

            // Reset form
            addCropForm.reset();
            // In a real app: fetch('/api/crops', { method: 'POST', body: ... })
        });
    }

    // Remove crop from table
    if (cropTableBody) {
        cropTableBody.addEventListener('click', (e) => {
            const removeButton = e.target.closest('.remove-btn');
            if (removeButton) {
                const row = removeButton.closest('tr');
                row.remove();
                // In a real app: fetch(`/api/crops/${cropId}`, { method: 'DELETE' })
            }
        });
    }

});