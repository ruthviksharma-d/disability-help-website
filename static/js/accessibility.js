/**
 * Disability Support India - Accessibility Features
 * Handles font size adjustment, high contrast mode, screen reader support, and other accessibility features
 */

(function() {
    'use strict';

    // Accessibility state
    let currentFontSize = 'normal';
    let isHighContrast = false;
    let currentLanguage = 'en';
    let speechSynthesis = null;
    let isScreenReaderMode = false;
    let currentTheme = 'light';

    // Initialize accessibility features when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
        initializeAccessibilityFeatures();
        loadAccessibilityPreferences();
    });

    /**
     * Initialize all accessibility features
     */
    function initializeAccessibilityFeatures() {
        initializeThemeSwitcher();
        initializeFontSizeControl();
        initializeHighContrastMode();
        initializeScreenReaderSupport();
        initializeLanguageSwitcher();
        initializeKeyboardShortcuts();
        initializeAriaLiveRegions();
        initializeFocusManagement();
        initializeMotionPreferences();
        initializeColorBlindnessSupport();
        addAccessibilityCSS();
    }

    /**
     * Theme switcher functionality
     */
    function initializeThemeSwitcher() {
        const themeToggleBtn = document.getElementById('theme-toggle-btn');
        if (!themeToggleBtn) return;

        themeToggleBtn.addEventListener('click', function() {
            toggleTheme();
        });

        // Add keyboard shortcut
        document.addEventListener('keydown', function(e) {
            if (e.ctrlKey && e.altKey && e.key === 't') {
                e.preventDefault();
                toggleTheme();
            }
        });

        updateThemeButton();
    }

    /**
     * Toggle between light and dark themes
     */
    function toggleTheme() {
        currentTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        // Apply theme to document
        if (currentTheme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
        
        updateThemeButton();
        saveAccessibilityPreference('theme', currentTheme);
        announceToScreenReader(`Switched to ${currentTheme} theme`);
    }

    /**
     * Update theme toggle button
     */
    function updateThemeButton() {
        const themeToggleBtn = document.getElementById('theme-toggle-btn');
        if (!themeToggleBtn) return;

        const icon = themeToggleBtn.querySelector('i');
        const text = themeToggleBtn.querySelector('.btn-text') || themeToggleBtn.childNodes[themeToggleBtn.childNodes.length - 1];
        
        if (currentTheme === 'dark') {
            themeToggleBtn.setAttribute('aria-label', 'Switch to light theme');
            if (icon) {
                icon.className = 'fas fa-sun';
            }
            if (text && text.textContent) {
                text.textContent = ' Light Theme';
            }
            themeToggleBtn.classList.add('active');
        } else {
            themeToggleBtn.setAttribute('aria-label', 'Switch to dark theme');
            if (icon) {
                icon.className = 'fas fa-moon';
            }
            if (text && text.textContent) {
                text.textContent = ' Dark Theme';
            }
            themeToggleBtn.classList.remove('active');
        }
    }

    /**
     * Font size control functionality
     */
    function initializeFontSizeControl() {
        const fontSizeBtn = document.getElementById('font-size-btn');
        if (!fontSizeBtn) return;

        fontSizeBtn.addEventListener('click', function() {
            cycleFontSize();
        });

        // Add keyboard shortcut
        document.addEventListener('keydown', function(e) {
            if (e.ctrlKey && e.key === '+') {
                e.preventDefault();
                increaseFontSize();
            } else if (e.ctrlKey && e.key === '-') {
                e.preventDefault();
                decreaseFontSize();
            } else if (e.ctrlKey && e.key === '0') {
                e.preventDefault();
                resetFontSize();
            }
        });

        updateFontSizeButton();
    }

    /**
     * Cycle through font sizes
     */
    function cycleFontSize() {
        switch(currentFontSize) {
            case 'normal':
                setFontSize('large');
                break;
            case 'large':
                setFontSize('extra-large');
                break;
            case 'extra-large':
                setFontSize('normal');
                break;
            default:
                setFontSize('normal');
        }
    }

    /**
     * Increase font size
     */
    function increaseFontSize() {
        switch(currentFontSize) {
            case 'normal':
                setFontSize('large');
                break;
            case 'large':
                setFontSize('extra-large');
                break;
        }
    }

    /**
     * Decrease font size
     */
    function decreaseFontSize() {
        switch(currentFontSize) {
            case 'extra-large':
                setFontSize('large');
                break;
            case 'large':
                setFontSize('normal');
                break;
        }
    }

    /**
     * Reset font size to normal
     */
    function resetFontSize() {
        setFontSize('normal');
    }

    /**
     * Set font size
     */
    function setFontSize(size) {
        const body = document.body;
        
        // Remove existing font size classes
        body.classList.remove('font-large', 'font-extra-large');
        
        // Add new font size class
        switch(size) {
            case 'large':
                body.classList.add('font-large');
                break;
            case 'extra-large':
                body.classList.add('font-extra-large');
                break;
        }
        
        currentFontSize = size;
        updateFontSizeButton();
        saveAccessibilityPreference('fontSize', size);
        announceToScreenReader(`Font size changed to ${size}`);
    }

    /**
     * Update font size button text
     */
    function updateFontSizeButton() {
        const fontSizeBtn = document.getElementById('font-size-btn');
        if (!fontSizeBtn) return;

        const icon = fontSizeBtn.querySelector('i');
        const text = fontSizeBtn.querySelector('.btn-text') || fontSizeBtn.childNodes[fontSizeBtn.childNodes.length - 1];
        
        switch(currentFontSize) {
            case 'large':
                fontSizeBtn.setAttribute('aria-label', 'Font size: Large. Click for Extra Large');
                if (text && text.textContent) {
                    text.textContent = ' Font: Large';
                }
                break;
            case 'extra-large':
                fontSizeBtn.setAttribute('aria-label', 'Font size: Extra Large. Click for Normal');
                if (text && text.textContent) {
                    text.textContent = ' Font: X-Large';
                }
                break;
            default:
                fontSizeBtn.setAttribute('aria-label', 'Font size: Normal. Click for Large');
                if (text && text.textContent) {
                    text.textContent = ' Font Size';
                }
        }
    }

    /**
     * High contrast mode functionality
     */
    function initializeHighContrastMode() {
        const contrastBtn = document.getElementById('high-contrast-btn');
        if (!contrastBtn) return;

        contrastBtn.addEventListener('click', function() {
            toggleHighContrast();
        });

        // Add keyboard shortcut
        document.addEventListener('keydown', function(e) {
            if (e.ctrlKey && e.altKey && e.key === 'c') {
                e.preventDefault();
                toggleHighContrast();
            }
        });

        updateContrastButton();
    }

    /**
     * Toggle high contrast mode
     */
    function toggleHighContrast() {
        isHighContrast = !isHighContrast;
        
        if (isHighContrast) {
            document.body.classList.add('high-contrast');
        } else {
            document.body.classList.remove('high-contrast');
        }
        
        updateContrastButton();
        saveAccessibilityPreference('highContrast', isHighContrast);
        announceToScreenReader(`High contrast mode ${isHighContrast ? 'enabled' : 'disabled'}`);
    }

    /**
     * Update contrast button
     */
    function updateContrastButton() {
        const contrastBtn = document.getElementById('high-contrast-btn');
        if (!contrastBtn) return;

        const text = contrastBtn.querySelector('.btn-text') || contrastBtn.childNodes[contrastBtn.childNodes.length - 1];
        
        if (isHighContrast) {
            contrastBtn.setAttribute('aria-label', 'High contrast mode enabled. Click to disable');
            contrastBtn.classList.add('active');
            if (text && text.textContent) {
                text.textContent = ' High Contrast: On';
            }
        } else {
            contrastBtn.setAttribute('aria-label', 'High contrast mode disabled. Click to enable');
            contrastBtn.classList.remove('active');
            if (text && text.textContent) {
                text.textContent = ' High Contrast';
            }
        }
    }

    /**
     * Screen reader support functionality
     */
    function initializeScreenReaderSupport() {
        const screenReaderBtn = document.getElementById('screen-reader-btn');
        if (!screenReaderBtn) return;

        // Check if speech synthesis is available
        if ('speechSynthesis' in window) {
            speechSynthesis = window.speechSynthesis;
            
            screenReaderBtn.addEventListener('click', function() {
                toggleScreenReaderMode();
            });

            // Add keyboard shortcut
            document.addEventListener('keydown', function(e) {
                if (e.ctrlKey && e.altKey && e.key === 's') {
                    e.preventDefault();
                    toggleScreenReaderMode();
                }
            });
        } else {
            screenReaderBtn.disabled = true;
            screenReaderBtn.setAttribute('aria-label', 'Text-to-speech not supported in this browser');
        }

        updateScreenReaderButton();
    }

    /**
     * Toggle screen reader mode
     */
    function toggleScreenReaderMode() {
        isScreenReaderMode = !isScreenReaderMode;
        
        if (isScreenReaderMode) {
            enableScreenReaderMode();
        } else {
            disableScreenReaderMode();
        }
        
        updateScreenReaderButton();
        saveAccessibilityPreference('screenReaderMode', isScreenReaderMode);
    }

    /**
     * Enable screen reader mode
     */
    function enableScreenReaderMode() {
        // Add event listeners for reading content
        document.addEventListener('click', readClickedElement);
        document.addEventListener('focus', readFocusedElement);
        
        // Read page title and main heading
        const title = document.title;
        const mainHeading = document.querySelector('h1');
        const introText = mainHeading ? 
            `${title}. Main heading: ${mainHeading.textContent}` : title;
        
        speakText(introText);
        announceToScreenReader('Screen reader mode enabled. Click on elements to hear them read aloud.');
    }

    /**
     * Disable screen reader mode
     */
    function disableScreenReaderMode() {
        // Remove event listeners
        document.removeEventListener('click', readClickedElement);
        document.removeEventListener('focus', readFocusedElement);
        
        // Stop any current speech
        if (speechSynthesis) {
            speechSynthesis.cancel();
        }
        
        announceToScreenReader('Screen reader mode disabled');
    }

    /**
     * Read clicked element
     */
    function readClickedElement(e) {
        if (!isScreenReaderMode) return;
        
        const element = e.target;
        const text = getReadableText(element);
        
        if (text) {
            speakText(text);
        }
    }

    /**
     * Read focused element
     */
    function readFocusedElement(e) {
        if (!isScreenReaderMode) return;
        
        const element = e.target;
        const text = getReadableText(element);
        
        if (text) {
            speakText(text);
        }
    }

    /**
     * Get readable text from element
     */
    function getReadableText(element) {
        // Priority order for text content
        const ariaLabel = element.getAttribute('aria-label');
        if (ariaLabel) return ariaLabel;
        
        const ariaLabelledBy = element.getAttribute('aria-labelledby');
        if (ariaLabelledBy) {
            const labelElement = document.getElementById(ariaLabelledBy);
            if (labelElement) return labelElement.textContent.trim();
        }
        
        const title = element.getAttribute('title');
        if (title) return title;
        
        const alt = element.getAttribute('alt');
        if (alt) return alt;
        
        const textContent = element.textContent.trim();
        if (textContent) return textContent;
        
        // For input elements
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            const label = document.querySelector(`label[for="${element.id}"]`);
            const labelText = label ? label.textContent.trim() : '';
            const value = element.value.trim();
            const placeholder = element.getAttribute('placeholder') || '';
            
            return `${labelText} ${element.tagName.toLowerCase()} ${value || placeholder}`.trim();
        }
        
        return '';
    }

    /**
     * Speak text using speech synthesis
     */
    function speakText(text) {
        if (!speechSynthesis || !text) return;
        
        // Cancel any ongoing speech
        speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.8;
        utterance.pitch = 1;
        utterance.volume = 1;
        
        // Set language based on current language setting
        utterance.lang = getLanguageCode(currentLanguage);
        
        speechSynthesis.speak(utterance);
    }

    /**
     * Update screen reader button
     */
    function updateScreenReaderButton() {
        const screenReaderBtn = document.getElementById('screen-reader-btn');
        if (!screenReaderBtn) return;

        const text = screenReaderBtn.querySelector('.btn-text') || screenReaderBtn.childNodes[screenReaderBtn.childNodes.length - 1];
        
        if (isScreenReaderMode) {
            screenReaderBtn.setAttribute('aria-label', 'Screen reader mode enabled. Click to disable');
            screenReaderBtn.classList.add('active');
            if (text && text.textContent) {
                text.textContent = ' Audio: On';
            }
        } else {
            screenReaderBtn.setAttribute('aria-label', 'Screen reader mode disabled. Click to enable');
            screenReaderBtn.classList.remove('active');
            if (text && text.textContent) {
                text.textContent = ' Audio';
            }
        }
    }

    /**
     * Language switcher functionality
     */
    function initializeLanguageSwitcher() {
        const languageSelect = document.getElementById('language-select');
        if (!languageSelect) return;

        languageSelect.addEventListener('change', function() {
            changeLanguage(this.value);
        });
    }

    /**
     * Change language
     */
    function changeLanguage(languageCode) {
        currentLanguage = languageCode;
        
        // Update HTML lang attribute
        document.documentElement.setAttribute('lang', languageCode);
        
        // Here you would typically load language-specific content
        // For now, we'll just announce the change
        const languageNames = {
            'en': 'English',
            'hi': 'Hindi',
            'bn': 'Bengali',
            'ta': 'Tamil',
            'te': 'Telugu',
            'mr': 'Marathi',
            'gu': 'Gujarati',
            'kn': 'Kannada'
        };
        
        const languageName = languageNames[languageCode] || languageCode;
        saveAccessibilityPreference('language', languageCode);
        announceToScreenReader(`Language changed to ${languageName}`);
    }

    /**
     * Get language code for speech synthesis
     */
    function getLanguageCode(lang) {
        const langMap = {
            'en': 'en-US',
            'hi': 'hi-IN',
            'bn': 'bn-IN',
            'ta': 'ta-IN',
            'te': 'te-IN',
            'mr': 'mr-IN',
            'gu': 'gu-IN',
            'kn': 'kn-IN'
        };
        return langMap[lang] || 'en-US';
    }

    /**
     * Keyboard shortcuts functionality
     */
    function initializeKeyboardShortcuts() {
        document.addEventListener('keydown', function(e) {
            // Alt + M: Main content
            if (e.altKey && e.key === 'm') {
                e.preventDefault();
                const mainContent = document.getElementById('main-content') || document.querySelector('main');
                if (mainContent) {
                    mainContent.focus();
                    mainContent.scrollIntoView();
                    announceToScreenReader('Jumped to main content');
                }
            }
            
            // Alt + N: Navigation
            if (e.altKey && e.key === 'n') {
                e.preventDefault();
                const navigation = document.querySelector('nav') || document.querySelector('.navbar');
                if (navigation) {
                    const firstLink = navigation.querySelector('a, button');
                    if (firstLink) {
                        firstLink.focus();
                        announceToScreenReader('Jumped to navigation');
                    }
                }
            }
            
            // Alt + S: Search
            if (e.altKey && e.key === 's') {
                e.preventDefault();
                const searchInput = document.getElementById('search-input');
                if (searchInput) {
                    searchInput.focus();
                    announceToScreenReader('Jumped to search');
                }
            }
            
            // Alt + H: Help
            if (e.altKey && e.key === 'h') {
                e.preventDefault();
                showAccessibilityHelp();
            }
        });
    }

    /**
     * Show accessibility help
     */
    function showAccessibilityHelp() {
        const helpText = `
            Accessibility shortcuts:
            Alt + M: Jump to main content
            Alt + N: Jump to navigation  
            Alt + S: Jump to search
            Alt + H: Show this help
            Ctrl + Plus: Increase font size
            Ctrl + Minus: Decrease font size
            Ctrl + 0: Reset font size
            Ctrl + Alt + C: Toggle high contrast
            Ctrl + Alt + S: Toggle screen reader mode
        `;
        
        alert(helpText);
        announceToScreenReader(helpText);
    }

    /**
     * ARIA live regions for dynamic content
     */
    function initializeAriaLiveRegions() {
        // Create status announcer if it doesn't exist
        if (!document.getElementById('aria-status')) {
            const statusDiv = document.createElement('div');
            statusDiv.id = 'aria-status';
            statusDiv.setAttribute('aria-live', 'polite');
            statusDiv.setAttribute('aria-atomic', 'true');
            statusDiv.className = 'sr-only';
            document.body.appendChild(statusDiv);
        }

        // Create alert announcer if it doesn't exist
        if (!document.getElementById('aria-alert')) {
            const alertDiv = document.createElement('div');
            alertDiv.id = 'aria-alert';
            alertDiv.setAttribute('aria-live', 'assertive');
            alertDiv.setAttribute('aria-atomic', 'true');
            alertDiv.className = 'sr-only';
            document.body.appendChild(alertDiv);
        }
    }

    /**
     * Focus management
     */
    function initializeFocusManagement() {
        // Enhance focus visibility
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
        });

        document.addEventListener('mousedown', function() {
            document.body.classList.remove('keyboard-navigation');
        });

        // Manage focus for dynamically loaded content
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(function(node) {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            enhanceAccessibility(node);
                        }
                    });
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    /**
     * Motion preferences
     */
    function initializeMotionPreferences() {
        // Respect user's motion preferences
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        
        function handleMotionPreference(e) {
            if (e.matches) {
                document.body.classList.add('reduce-motion');
                announceToScreenReader('Reduced motion enabled');
            } else {
                document.body.classList.remove('reduce-motion');
            }
        }

        mediaQuery.addListener(handleMotionPreference);
        handleMotionPreference(mediaQuery);
    }

    /**
     * Color blindness support
     */
    function initializeColorBlindnessSupport() {
        // Add pattern backgrounds for better distinction
        const styleSheet = document.createElement('style');
        styleSheet.textContent = `
            .colorblind-patterns .bg-primary { background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="4" height="4" viewBox="0 0 4 4"><rect width="2" height="2" fill="rgba(255,255,255,0.3)"/></svg>'); }
            .colorblind-patterns .bg-success { background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="4" height="4" viewBox="0 0 4 4"><circle cx="2" cy="2" r="1" fill="rgba(255,255,255,0.3)"/></svg>'); }
            .colorblind-patterns .bg-warning { background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="4" height="4" viewBox="0 0 4 4"><rect x="1" y="1" width="2" height="2" fill="rgba(0,0,0,0.3)"/></svg>'); }
            .colorblind-patterns .bg-danger { background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="4" height="4" viewBox="0 0 4 4"><polygon points="2,0 4,4 0,4" fill="rgba(255,255,255,0.3)"/></svg>'); }
        `;
        document.head.appendChild(styleSheet);
    }

    /**
     * Add custom accessibility CSS
     */
    function addAccessibilityCSS() {
        const accessibilityCSS = `
            .keyboard-navigation *:focus {
                outline: 3px solid #fd7e14;
                outline-offset: 2px;
            }
            
            .reduce-motion * {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
                scroll-behavior: auto !important;
            }
            
            .sr-only {
                position: absolute !important;
                width: 1px !important;
                height: 1px !important;
                padding: 0 !important;
                margin: -1px !important;
                overflow: hidden !important;
                clip: rect(0, 0, 0, 0) !important;
                white-space: nowrap !important;
                border: 0 !important;
            }
            
            @media (prefers-reduced-motion: reduce) {
                *, *::before, *::after {
                    animation-duration: 0.01ms !important;
                    animation-iteration-count: 1 !important;
                    transition-duration: 0.01ms !important;
                    scroll-behavior: auto !important;
                }
            }
        `;

        const styleElement = document.createElement('style');
        styleElement.textContent = accessibilityCSS;
        document.head.appendChild(styleElement);
    }

    /**
     * Enhance accessibility for new elements
     */
    function enhanceAccessibility(element) {
        // Add missing alt text for images
        const images = element.querySelectorAll('img:not([alt])');
        images.forEach(img => {
            img.setAttribute('alt', '');
        });

        // Add ARIA labels for buttons without text
        const buttons = element.querySelectorAll('button:not([aria-label])');
        buttons.forEach(button => {
            if (!button.textContent.trim()) {
                const icon = button.querySelector('i');
                if (icon) {
                    const iconClass = icon.className;
                    button.setAttribute('aria-label', generateButtonLabel(iconClass));
                }
            }
        });

        // Ensure form labels are properly associated
        const inputs = element.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            if (input.id && !input.getAttribute('aria-labelledby') && !input.getAttribute('aria-label')) {
                const label = element.querySelector(`label[for="${input.id}"]`);
                if (!label) {
                    // Try to find a nearby label
                    const nearbyLabel = input.closest('.form-group, .mb-3')?.querySelector('label');
                    if (nearbyLabel) {
                        const labelId = 'label-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
                        nearbyLabel.id = labelId;
                        input.setAttribute('aria-labelledby', labelId);
                    }
                }
            }
        });
    }

    /**
     * Generate button label from icon class
     */
    function generateButtonLabel(iconClass) {
        const iconMap = {
            'fa-search': 'Search',
            'fa-menu': 'Menu',
            'fa-close': 'Close',
            'fa-edit': 'Edit',
            'fa-delete': 'Delete',
            'fa-save': 'Save',
            'fa-print': 'Print',
            'fa-download': 'Download',
            'fa-upload': 'Upload',
            'fa-phone': 'Phone',
            'fa-email': 'Email',
            'fa-home': 'Home',
            'fa-user': 'User',
            'fa-settings': 'Settings'
        };

        for (const [className, label] of Object.entries(iconMap)) {
            if (iconClass.includes(className)) {
                return label;
            }
        }

        return 'Button';
    }

    /**
     * Save accessibility preference
     */
    function saveAccessibilityPreference(key, value) {
        try {
            localStorage.setItem(`accessibility-${key}`, JSON.stringify(value));
        } catch (e) {
            console.warn('Could not save accessibility preference:', e);
        }
    }

    /**
     * Load accessibility preference
     */
    function loadAccessibilityPreference(key, defaultValue = null) {
        try {
            const stored = localStorage.getItem(`accessibility-${key}`);
            return stored ? JSON.parse(stored) : defaultValue;
        } catch (e) {
            console.warn('Could not load accessibility preference:', e);
            return defaultValue;
        }
    }

    /**
     * Load all accessibility preferences
     */
    function loadAccessibilityPreferences() {
        // Load theme preference
        const savedTheme = loadAccessibilityPreference('theme', 'light');
        if (savedTheme === 'dark') {
            currentTheme = 'light'; // Set to light so toggle works correctly
            toggleTheme();
        }

        // Load font size
        const savedFontSize = loadAccessibilityPreference('fontSize', 'normal');
        if (savedFontSize !== 'normal') {
            setFontSize(savedFontSize);
        }

        // Load high contrast
        const savedHighContrast = loadAccessibilityPreference('highContrast', false);
        if (savedHighContrast) {
            isHighContrast = false; // Set to false so toggle works correctly
            toggleHighContrast();
        }

        // Load screen reader mode
        const savedScreenReaderMode = loadAccessibilityPreference('screenReaderMode', false);
        if (savedScreenReaderMode && speechSynthesis) {
            isScreenReaderMode = false; // Set to false so toggle works correctly
            toggleScreenReaderMode();
        }

        // Load language
        const savedLanguage = loadAccessibilityPreference('language', 'en');
        if (savedLanguage !== 'en') {
            changeLanguage(savedLanguage);
            const languageSelect = document.getElementById('language-select');
            if (languageSelect) {
                languageSelect.value = savedLanguage;
            }
        }
    }

    /**
     * Announce to screen reader via ARIA live regions
     */
    function announceToScreenReader(message, priority = 'polite') {
        const announcer = document.getElementById(priority === 'assertive' ? 'aria-alert' : 'aria-status');
        if (announcer) {
            // Clear the announcer first, then set the message
            announcer.textContent = '';
            setTimeout(() => {
                announcer.textContent = message;
            }, 100);
        }

        // Also speak if screen reader mode is enabled
        if (isScreenReaderMode) {
            speakText(message);
        }
    }

    /**
     * Reset all accessibility settings
     */
    function resetAccessibilitySettings() {
        // Reset font size
        setFontSize('normal');
        
        // Reset high contrast
        if (isHighContrast) {
            toggleHighContrast();
        }
        
        // Reset screen reader mode
        if (isScreenReaderMode) {
            toggleScreenReaderMode();
        }
        
        // Reset language
        changeLanguage('en');
        const languageSelect = document.getElementById('language-select');
        if (languageSelect) {
            languageSelect.value = 'en';
        }
        
        // Clear all saved preferences
        const keys = ['fontSize', 'highContrast', 'screenReaderMode', 'language'];
        keys.forEach(key => {
            try {
                localStorage.removeItem(`accessibility-${key}`);
            } catch (e) {
                console.warn('Could not clear accessibility preference:', e);
            }
        });
        
        announceToScreenReader('All accessibility settings have been reset to default');
    }

    // Export accessibility functions for external use
    window.DisabilitySupportAccessibility = {
        setFontSize,
        toggleHighContrast,
        toggleScreenReaderMode,
        changeLanguage,
        announceToScreenReader,
        resetAccessibilitySettings,
        speakText,
        getCurrentSettings: function() {
            return {
                fontSize: currentFontSize,
                highContrast: isHighContrast,
                screenReaderMode: isScreenReaderMode,
                language: currentLanguage
            };
        }
    };

    // Announce that accessibility features are ready
    setTimeout(() => {
        announceToScreenReader('Accessibility features loaded. Press Alt+H for help with keyboard shortcuts.');
    }, 2000);

})();
