// This is js/admin-loader.js
document.addEventListener("DOMContentLoaded", () => {
    
    const loadComponent = (id, url, callback) => {
        fetch(url)
            .then(response => {
                if (!response.ok) throw new Error(`Could not load ${url}`);
                return response.text();
            })
            .then(data => {
                document.getElementById(id).innerHTML = data;
                if (callback) callback();
            })
            .catch(error => console.error(`Error loading ${url}:`, error));
    };

    // This function highlights the active nav link
    const highlightActiveNav = () => {
        const currentPage = window.location.pathname.split('/').pop();
        if (!currentPage) return;

        const navLinks = document.querySelectorAll('#admin-header-placeholder nav a.admin-nav-link');
        
        navLinks.forEach(link => {
            const linkPage = link.getAttribute('href').split('/').pop();
            if (linkPage === currentPage) {
                link.classList.add('active');
            }
        });
    };

    // Load admin header, then highlight nav
    loadComponent('admin-header-placeholder', 'admin-header.html', highlightActiveNav);
    
    // Load admin footer
    loadComponent('admin-footer-placeholder', 'admin-footer.html');
});