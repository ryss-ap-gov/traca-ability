document.addEventListener('DOMContentLoaded', () => {

    // Function to update all text on the page
    function updateContent() {
        // Update all standard text elements
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            let translation = "";

            if (key.startsWith('[placeholder]')) {
                // Handle placeholders
                const placeholderKey = key.substring(13); // Remove '[placeholder]'
                translation = i18next.t(placeholderKey);
                if (translation && translation !== placeholderKey) el.placeholder = translation;
            } else if (key.startsWith('[title]')) {
                // Handle titles
                const titleKey = key.substring(7); // Remove '[title]'
                translation = i18next.t(titleKey);
                if (translation && translation !== titleKey) el.title = translation;
            } else if (key.startsWith('[value]')) {
                // Handle input values
                const valueKey = key.substring(7); // Remove '[value]'
                translation = i18next.t(valueKey);
                if (translation && translation !== valueKey) el.value = translation;
            } else {
                // Handle all other text (innerHTML)
                translation = i18next.t(key);
                // Only update if a translation is found and it's not the key itself
                if (translation && translation !== key) el.innerHTML = translation;
            }
        });
        
        // Update the page's <title> tag
        const pageTitle = document.getElementById('pageTitle');
        if (pageTitle) {
            const titleKey = pageTitle.getAttribute('data-i18n');
            if(titleKey) {
                const translation = i18next.t(titleKey);
                if (translation && translation !== titleKey) document.title = translation;
            }
        }
    }

    // Function to setup the language dropdown
    function setupSwitcher() {
        const languageSwitcher = document.getElementById('language-switcher');
        
        // This checks if the header/switcher has loaded.
        if (!languageSwitcher) {
            setTimeout(setupSwitcher, 250); // Try again in 250ms
            return;
        }

        const currentLang = localStorage.getItem('preferredLanguage') || i18next.language;
        languageSwitcher.value = currentLang;

        languageSwitcher.addEventListener('change', (event) => {
            const newLang = event.target.value;
            i18next.changeLanguage(newLang, (err, t) => {
                if (err) return console.error('Error changing language:', err);
                updateContent(); // Re-translate the page
                localStorage.setItem('preferredLanguage', newLang); // Save user's choice
                document.documentElement.lang = newLang; // Update <html> lang attribute
            });
        });
    }

    // Get saved language from localStorage or default to 'en'
    const preferredLang = localStorage.getItem('preferredLanguage') || 'en';
    document.documentElement.lang = preferredLang; // Set initial lang attribute

    i18next
        .use(i18nextHttpBackend) // Use plugin to load files from server
        .init({
            lng: preferredLang,    // Set initial language
            fallbackLng: 'en',     // If a translation is missing, use English
            debug: true,           // This will print helpful logs to your F12 Console
            ns: ['translation'],   // Namespace for your files
            defaultNS: 'translation',
            backend: {
                // =========================================================
                //
                // THIS IS THE CORRECTED PATH. REMOVED THE "../"
                //
                loadPath: 'locales/{{lng}}/{{ns}}.json' 
                //
                // =========================================================
            }
        }, (err, t) => {
            // This function runs once initialization is complete
            if (err) {
                console.error("--- TRANSLATION FAILED ---");
                console.error(err);
                console.error("This 404 error means your 'locales' folder or 'translation.json' file is missing or misspelled.");
                return;
            }
            
            console.log('--- i18next initialized successfully ---');
            updateContent(); // Translate the page on first load
            setupSwitcher(); // Activate the dropdown
        });

});