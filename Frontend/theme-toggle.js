// theme-toggle.js
// Dark mode toggle functionality for HealthCheck

(function() {
    'use strict';

    // Theme constants
    const THEME_KEY = 'healthcheck-theme';
    const DARK_THEME = 'dark';
    const LIGHT_THEME = 'light';

    /**
     * Get the current theme from localStorage or system preference
     */
    function getPreferredTheme() {
        const savedTheme = localStorage.getItem(THEME_KEY);
        if (savedTheme) {
            return savedTheme;
        }
        // Check system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return DARK_THEME;
        }
        return LIGHT_THEME;
    }

    /**
     * Apply the theme to the document
     */
    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem(THEME_KEY, theme);
        updateToggleButton(theme);
    }

    /**
     * Toggle between light and dark themes
     */
    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || LIGHT_THEME;
        const newTheme = currentTheme === DARK_THEME ? LIGHT_THEME : DARK_THEME;
        applyTheme(newTheme);
    }

    /**
     * Update the toggle button icon and text
     */
    function updateToggleButton(theme) {
        const toggleBtn = document.getElementById('themeToggle');
        if (toggleBtn) {
            const icon = toggleBtn.querySelector('.icon');
            const text = toggleBtn.querySelector('.text');
            
            if (theme === DARK_THEME) {
                if (icon) icon.textContent = '☀️';
                if (text) text.textContent = 'Modo Claro';
            } else {
                if (icon) icon.textContent = '🌙';
                if (text) text.textContent = 'Modo Oscuro';
            }
        }
    }

    /**
     * Create and inject the toggle button into the header
     */
    function createToggleButton() {
        const rightMenu = document.querySelector('.right-menu');
        const header = document.querySelector('header');
        
        // Check if toggle already exists
        if (document.getElementById('themeToggle')) {
            return;
        }

        const toggleBtn = document.createElement('button');
        toggleBtn.id = 'themeToggle';
        toggleBtn.className = 'theme-toggle';
        toggleBtn.setAttribute('aria-label', 'Toggle dark mode');
        
        const currentTheme = getPreferredTheme();
        toggleBtn.innerHTML = `
            <span class="icon">${currentTheme === DARK_THEME ? '☀️' : '🌙'}</span>`;
        
        toggleBtn.addEventListener('click', toggleTheme);

        // Insert the button
        if (rightMenu) {
            rightMenu.insertBefore(toggleBtn, rightMenu.firstChild);
        } else if (header) {
            // Create right-menu if it doesn't exist
            const newRightMenu = document.createElement('div');
            newRightMenu.className = 'right-menu';
            newRightMenu.appendChild(toggleBtn);
            header.appendChild(newRightMenu);
        }
    }

    /**
     * Initialize theme on page load
     */
    function init() {
        // Apply saved theme immediately (before DOM ready to prevent flash)
        const theme = getPreferredTheme();
        document.documentElement.setAttribute('data-theme', theme);

        // Wait for DOM to be ready to create button
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                createToggleButton();
                applyTheme(theme);
            });
        } else {
            createToggleButton();
            applyTheme(theme);
        }

        // Listen for system theme changes
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                if (!localStorage.getItem(THEME_KEY)) {
                    applyTheme(e.matches ? DARK_THEME : LIGHT_THEME);
                }
            });
        }
    }

    // Initialize
    init();

    // Expose toggle function globally if needed
    window.toggleTheme = toggleTheme;
})();
