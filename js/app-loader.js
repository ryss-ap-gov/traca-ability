
document.addEventListener("DOMContentLoaded", () => {
    

    const loadComponent = (id, url, callback) => {

        fetch(url)
            .then(response => {
                if (!response.ok) throw new Error(`Could not load ${url}`);
                return response.text();
            })
            .then(data => {
                document.getElementById(id).innerHTML = data;
                if (callback) callback(); // Run callback after loading
            })
            .catch(error => console.error(`Error loading ${url}:`, error));
    };


    const highlightActiveNav = () => {

        const currentPage = window.location.pathname.split('/').pop();
        if (!currentPage) return;

        const navLinks = document.querySelectorAll('#header-placeholder nav a');
        
        navLinks.forEach(link => {
            const linkPage = link.getAttribute('href').split('/').pop();
            if (linkPage === currentPage) {
                link.classList.add('active');
            }
        });
    };

   
    loadComponent('header-placeholder', 'header.html', highlightActiveNav);
    

    loadComponent('footer-placeholder', 'footer.html');
});