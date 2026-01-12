
        document.getElementById('btnGetCatchment').addEventListener('click', function() {
            const farmerId = document.getElementById('searchFarmerId').value;
            const resultsDiv = document.getElementById('farmerResults');

            if(!farmerId) {
                alert("Please enter a Farmer ID");
                return;
            }

            // Simulate an API call / Fetching data
            // In a real app, you would use fetch('/api/farmer/' + farmerId)
            
            // Mock Data for Demo
            const mockData = {
                district: "Anantapur",
                mandal: "Hindupur",
                panchayat: "Kirikera",
                village: "Moda",
                vo: "Sri Lakshmi VO",
                shg: "Jyothi SHG"
            };

            // Populate fields
            document.getElementById('frm_district').value = mockData.district;
            document.getElementById('frm_mandal').value = mockData.mandal;
            document.getElementById('frm_panchayat').value = mockData.panchayat;
            document.getElementById('frm_village').value = mockData.village;
            document.getElementById('frm_vo_name').value = mockData.vo;
            document.getElementById('frm_shg_name').value = mockData.shg;

            // Show the section
            resultsDiv.style.display = 'block';
        });
    