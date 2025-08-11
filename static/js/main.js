/**
 * Disability Support India - Main JavaScript
 * Handles general UI interactions, search, navigation, and form functionality
 */

(function() {
    'use strict';

    // Wait for DOM to be fully loaded
    document.addEventListener('DOMContentLoaded', function() {
        initializeMainFunctionality();
    });

    /**
     * Initialize all main functionality
     */
    function initializeMainFunctionality() {
        initializeSearch();
        initializeCityNavigation();
        initializeFormEnhancements();
        initializeMobileMenu();
        initializeScrollToTop();
        initializeTooltips();
        initializeLazyLoading();
        initializeKeyboardNavigation();
        announcePageLoad();
    }

    /**
     * Search functionality with autocomplete
     */
    function initializeSearch() {
        const searchInput = document.getElementById('search-input');
        const searchResults = document.getElementById('search-results');
        const searchForm = searchInput?.closest('form');
        let searchTimeout;

        if (!searchInput || !searchResults) return;

        // Add ARIA attributes
        searchInput.setAttribute('aria-expanded', 'false');
        searchInput.setAttribute('aria-autocomplete', 'list');
        searchInput.setAttribute('role', 'combobox');
        searchResults.setAttribute('role', 'listbox');

        // Search input event listener
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            const query = this.value.trim();

            if (query.length < 2) {
                hideSearchResults();
                return;
            }

            // Debounce search requests
            searchTimeout = setTimeout(() => {
                performSearch(query);
            }, 300);
        });

        // Handle search form submission
        if (searchForm) {
            searchForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const query = searchInput.value.trim();
                if (query) {
                    performSearch(query, true);
                }
            });
        }

        // Hide results when clicking outside
        document.addEventListener('click', function(e) {
            if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
                hideSearchResults();
            }
        });

        // Keyboard navigation for search results
        searchInput.addEventListener('keydown', function(e) {
            const activeResult = searchResults.querySelector('.search-result-item.active');
            const allResults = searchResults.querySelectorAll('.search-result-item');

            switch(e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    navigateSearchResults(allResults, activeResult, 'down');
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    navigateSearchResults(allResults, activeResult, 'up');
                    break;
                case 'Enter':
                    if (activeResult) {
                        e.preventDefault();
                        activeResult.click();
                    }
                    break;
                case 'Escape':
                    hideSearchResults();
                    break;
            }
        });
    }

    /**
     * Perform search operation
     */
    function performSearch(query, redirect = false) {
        const currentCity = getCurrentCity();
        const searchUrl = `/api/search?q=${encodeURIComponent(query)}&city=${encodeURIComponent(currentCity)}`;

        // Show loading state
        showSearchLoading();

        // Use simple HTTP request instead of fetch for better compatibility
        const xhr = new XMLHttpRequest();
        xhr.open('GET', searchUrl, true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    try {
                        const results = JSON.parse(xhr.responseText);
                        displaySearchResults(results, query);
                    } catch (e) {
                        showSearchError('Invalid response format');
                    }
                } else {
                    showSearchError('Search temporarily unavailable');
                }
            }
        };
        xhr.send();
    }

    /**
     * Display search results
     */
    function displaySearchResults(results, query) {
        const searchResults = document.getElementById('search-results');
        const searchContent = document.getElementById('search-results-content');

        if (!results || results.length === 0) {
            searchContent.innerHTML = `
                <div class="text-center p-3">
                    <i class="fas fa-search text-muted mb-2" aria-hidden="true"></i>
                    <p class="mb-0">No results found for "${escapeHtml(query)}"</p>
                    <small class="text-muted">Try using different keywords</small>
                </div>
            `;
        } else {
            const resultItems = results.map((result, index) => `
                <div class="search-result-item" role="option" tabindex="-1" data-url="${escapeHtml(result.url)}">
                    <div class="d-flex align-items-center">
                        <div class="result-icon me-2">
                            <i class="fas fa-${getResultIcon(result.type)} text-primary" aria-hidden="true"></i>
                        </div>
                        <div class="result-content flex-grow-1">
                            <div class="result-title fw-bold">${escapeHtml(result.title)}</div>
                            <div class="result-description text-muted small">${escapeHtml(result.description)}</div>
                            <span class="badge bg-secondary">${escapeHtml(result.type)}</span>
                        </div>
                    </div>
                </div>
            `).join('');

            searchContent.innerHTML = resultItems;

            // Add click handlers to result items
            searchContent.querySelectorAll('.search-result-item').forEach(item => {
                item.addEventListener('click', function() {
                    const url = this.dataset.url;
                    if (url) {
                        window.location.href = url;
                    }
                });

                item.addEventListener('mouseenter', function() {
                    clearActiveSearchResult();
                    this.classList.add('active');
                });
            });
        }

        showSearchResults();
        announceSearchResults(results.length, query);
    }

    /**
     * Navigate search results with keyboard
     */
    function navigateSearchResults(allResults, activeResult, direction) {
        if (allResults.length === 0) return;

        clearActiveSearchResult();

        let newIndex = 0;
        if (activeResult) {
            const currentIndex = Array.from(allResults).indexOf(activeResult);
            if (direction === 'down') {
                newIndex = (currentIndex + 1) % allResults.length;
            } else {
                newIndex = currentIndex === 0 ? allResults.length - 1 : currentIndex - 1;
            }
        }

        allResults[newIndex].classList.add('active');
        allResults[newIndex].focus();
    }

    /**
     * Clear active search result
     */
    function clearActiveSearchResult() {
        const activeResult = document.querySelector('.search-result-item.active');
        if (activeResult) {
            activeResult.classList.remove('active');
        }
    }

    /**
     * Show search results
     */
    function showSearchResults() {
        const searchResults = document.getElementById('search-results');
        const searchInput = document.getElementById('search-input');
        
        searchResults.style.display = 'block';
        searchInput.setAttribute('aria-expanded', 'true');
    }

    /**
     * Hide search results
     */
    function hideSearchResults() {
        const searchResults = document.getElementById('search-results');
        const searchInput = document.getElementById('search-input');
        
        searchResults.style.display = 'none';
        searchInput.setAttribute('aria-expanded', 'false');
        clearActiveSearchResult();
    }

    /**
     * Show search loading state
     */
    function showSearchLoading() {
        const searchContent = document.getElementById('search-results-content');
        searchContent.innerHTML = `
            <div class="text-center p-3">
                <i class="fas fa-spinner fa-spin text-primary mb-2" aria-hidden="true"></i>
                <p class="mb-0">Searching...</p>
            </div>
        `;
        showSearchResults();
    }

    /**
     * Show search error
     */
    function showSearchError(message) {
        const searchContent = document.getElementById('search-results-content');
        searchContent.innerHTML = `
            <div class="text-center p-3">
                <i class="fas fa-exclamation-triangle text-warning mb-2" aria-hidden="true"></i>
                <p class="mb-0">${escapeHtml(message)}</p>
            </div>
        `;
        showSearchResults();
    }

    /**
     * Get icon for search result type
     */
    function getResultIcon(type) {
        const icons = {
            'scheme': 'file-alt',
            'help_center': 'hospital',
            'event': 'calendar',
            'product': 'tools',
            'legal': 'gavel',
            'contact': 'envelope'
        };
        return icons[type] || 'info-circle';
    }

    /**
     * City navigation functionality
     */
    function initializeCityNavigation() {
        const citySelectors = document.querySelectorAll('#city-select, .city-selector');
        
        citySelectors.forEach(selector => {
            selector.addEventListener('change', function() {
                const selectedCity = this.value;
                if (selectedCity) {
                    localStorage.setItem('selectedCity', selectedCity);
                    updateCityContext(selectedCity);
                }
            });
        });

        // Load saved city on page load
        const savedCity = localStorage.getItem('selectedCity');
        if (savedCity) {
            citySelectors.forEach(selector => {
                if (selector.querySelector(`option[value="${savedCity}"]`)) {
                    selector.value = savedCity;
                }
            });
            updateCityContext(savedCity);
        }
    }

    /**
     * Update city context throughout the page
     */
    function updateCityContext(cityName) {
        // Update any city-specific links
        const cityLinks = document.querySelectorAll('[data-city-link]');
        cityLinks.forEach(link => {
            const baseUrl = link.dataset.cityLink;
            link.href = `${baseUrl}?city=${encodeURIComponent(cityName)}`;
        });

        // Update breadcrumbs if present
        const cityBreadcrumb = document.querySelector('.city-breadcrumb');
        if (cityBreadcrumb) {
            cityBreadcrumb.textContent = cityName;
        }

        // Announce city change to screen readers
        announceToScreenReader(`City changed to ${cityName}`);
    }

    /**
     * Get current city from various sources
     */
    function getCurrentCity() {
        // Try to get from localStorage first
        let city = localStorage.getItem('selectedCity');
        
        // Try to get from current page URL
        if (!city) {
            const urlMatch = window.location.pathname.match(/\/city\/([^\/]+)/);
            if (urlMatch) {
                city = decodeURIComponent(urlMatch[1]);
            }
        }

        // Try to get from city selector
        if (!city) {
            const citySelector = document.getElementById('city-select');
            if (citySelector && citySelector.value) {
                city = citySelector.value;
            }
        }

        return city || '';
    }

    /**
     * Enhanced form functionality
     */
    function initializeFormEnhancements() {
        // Auto-save form data
        initializeFormAutoSave();
        
        // Form validation enhancements
        initializeFormValidation();
        
        // File upload enhancements
        initializeFileUploads();
        
        // Dynamic form fields
        initializeDynamicFields();
    }

    /**
     * Auto-save form data to localStorage
     */
    function initializeFormAutoSave() {
        const forms = document.querySelectorAll('form[data-autosave]');
        
        forms.forEach(form => {
            const formId = form.id || 'unnamed-form';
            const inputs = form.querySelectorAll('input, textarea, select');
            
            // Load saved data
            loadFormData(formId, inputs);
            
            // Save data on input
            inputs.forEach(input => {
                input.addEventListener('input', () => {
                    saveFormData(formId, inputs);
                });
                
                input.addEventListener('change', () => {
                    saveFormData(formId, inputs);
                });
            });
            
            // Clear saved data on successful submission
            form.addEventListener('submit', () => {
                setTimeout(() => {
                    clearFormData(formId);
                }, 1000);
            });
        });
    }

    /**
     * Enhanced form validation
     */
    function initializeFormValidation() {
        const forms = document.querySelectorAll('form');
        
        forms.forEach(form => {
            form.addEventListener('submit', function(e) {
                if (!validateForm(this)) {
                    e.preventDefault();
                    const firstError = this.querySelector('.is-invalid, [aria-invalid="true"]');
                    if (firstError) {
                        firstError.focus();
                        announceToScreenReader('Please correct the errors in the form');
                    }
                }
            });
            
            // Real-time validation
            const inputs = form.querySelectorAll('input, textarea, select');
            inputs.forEach(input => {
                input.addEventListener('blur', () => {
                    validateField(input);
                });
                
                input.addEventListener('input', () => {
                    if (input.classList.contains('is-invalid')) {
                        validateField(input);
                    }
                });
            });
        });
    }

    /**
     * Validate individual form field
     */
    function validateField(field) {
        const value = field.value.trim();
        const isRequired = field.hasAttribute('required');
        const type = field.type;
        let isValid = true;
        let errorMessage = '';

        // Required field validation
        if (isRequired && !value) {
            isValid = false;
            errorMessage = 'This field is required';
        }

        // Email validation
        if (type === 'email' && value && !isValidEmail(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid email address';
        }

        // Phone validation
        if (type === 'tel' && value && !isValidPhone(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid phone number';
        }

        // Update field appearance
        updateFieldValidation(field, isValid, errorMessage);
        
        return isValid;
    }

    /**
     * Update field validation appearance
     */
    function updateFieldValidation(field, isValid, errorMessage) {
        const feedbackElement = field.parentNode.querySelector('.invalid-feedback') || 
                               field.parentNode.querySelector('.form-text');

        if (isValid) {
            field.classList.remove('is-invalid');
            field.classList.add('is-valid');
            field.setAttribute('aria-invalid', 'false');
            if (feedbackElement) {
                feedbackElement.textContent = '';
            }
        } else {
            field.classList.remove('is-valid');
            field.classList.add('is-invalid');
            field.setAttribute('aria-invalid', 'true');
            
            if (feedbackElement) {
                feedbackElement.textContent = errorMessage;
                feedbackElement.classList.add('invalid-feedback');
            } else {
                // Create feedback element
                const feedback = document.createElement('div');
                feedback.className = 'invalid-feedback';
                feedback.textContent = errorMessage;
                field.parentNode.appendChild(feedback);
            }
        }
    }

    /**
     * Validate entire form
     */
    function validateForm(form) {
        const inputs = form.querySelectorAll('input, textarea, select');
        let isFormValid = true;

        inputs.forEach(input => {
            if (!validateField(input)) {
                isFormValid = false;
            }
        });

        return isFormValid;
    }

    /**
     * Initialize mobile menu enhancements
     */
    function initializeMobileMenu() {
        const navbarToggler = document.querySelector('.navbar-toggler');
        const navbarCollapse = document.querySelector('.navbar-collapse');

        if (navbarToggler && navbarCollapse) {
            navbarToggler.addEventListener('click', function() {
                const isExpanded = this.getAttribute('aria-expanded') === 'true';
                announceToScreenReader(isExpanded ? 'Menu collapsed' : 'Menu expanded');
            });

            // Close menu when clicking outside
            document.addEventListener('click', function(e) {
                if (!navbarToggler.contains(e.target) && !navbarCollapse.contains(e.target)) {
                    if (navbarCollapse.classList.contains('show')) {
                        navbarToggler.click();
                    }
                }
            });

            // Close menu on escape key
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape' && navbarCollapse.classList.contains('show')) {
                    navbarToggler.click();
                    navbarToggler.focus();
                }
            });
        }
    }

    /**
     * Scroll to top functionality
     */
    function initializeScrollToTop() {
        // Create scroll to top button
        const scrollButton = document.createElement('button');
        scrollButton.innerHTML = '<i class="fas fa-arrow-up" aria-hidden="true"></i>';
        scrollButton.className = 'btn btn-primary scroll-to-top';
        scrollButton.setAttribute('aria-label', 'Scroll to top of page');
        scrollButton.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 1000;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            display: none;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        `;

        document.body.appendChild(scrollButton);

        // Show/hide button based on scroll position
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                scrollButton.style.display = 'block';
            } else {
                scrollButton.style.display = 'none';
            }
        });

        // Scroll to top when clicked
        scrollButton.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            announceToScreenReader('Scrolled to top of page');
        });
    }

    /**
     * Initialize tooltips
     */
    function initializeTooltips() {
        // Simple tooltip implementation for accessibility
        const tooltipElements = document.querySelectorAll('[data-tooltip]');
        
        tooltipElements.forEach(element => {
            const tooltipText = element.dataset.tooltip;
            element.setAttribute('aria-label', tooltipText);
            element.setAttribute('title', tooltipText);
        });
    }

    /**
     * Initialize lazy loading for images
     */
    function initializeLazyLoading() {
        const images = document.querySelectorAll('img[data-src]');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                });
            });

            images.forEach(img => imageObserver.observe(img));
        } else {
            // Fallback for older browsers
            images.forEach(img => {
                img.src = img.dataset.src;
            });
        }
    }

    /**
     * Enhanced keyboard navigation
     */
    function initializeKeyboardNavigation() {
        // Skip links functionality
        const skipLinks = document.querySelectorAll('.skip-link');
        skipLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.focus();
                    target.scrollIntoView();
                }
            });
        });

        // Escape key handling for modals and dropdowns
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                // Close any open modals
                const openModal = document.querySelector('.modal.show');
                if (openModal) {
                    const closeButton = openModal.querySelector('.btn-close, [data-bs-dismiss="modal"]');
                    if (closeButton) {
                        closeButton.click();
                    }
                }

                // Close search results
                hideSearchResults();
            }
        });

        // Tab trapping for modals
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Tab') {
                const activeModal = document.querySelector('.modal.show');
                if (activeModal) {
                    trapTabInModal(e, activeModal);
                }
            }
        });
    }

    /**
     * Trap tab navigation within modal
     */
    function trapTabInModal(e, modal) {
        const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
        }
    }

    /**
     * Announce page load to screen readers
     */
    function announcePageLoad() {
        const pageTitle = document.title;
        const mainHeading = document.querySelector('h1');
        const announcement = mainHeading ? 
            `Page loaded: ${pageTitle}. Main heading: ${mainHeading.textContent}` :
            `Page loaded: ${pageTitle}`;
        
        setTimeout(() => {
            announceToScreenReader(announcement);
        }, 1000);
    }

    /**
     * Announce search results to screen readers
     */
    function announceSearchResults(count, query) {
        const announcement = count === 0 ?
            `No search results found for ${query}` :
            `${count} search result${count === 1 ? '' : 's'} found for ${query}`;
        
        announceToScreenReader(announcement);
    }

    /**
     * Announce message to screen readers
     */
    function announceToScreenReader(message) {
        let announcer = document.getElementById('screen-reader-announcer');
        if (!announcer) {
            announcer = document.createElement('div');
            announcer.id = 'screen-reader-announcer';
            announcer.setAttribute('aria-live', 'polite');
            announcer.setAttribute('aria-atomic', 'true');
            announcer.className = 'sr-only';
            document.body.appendChild(announcer);
        }
        
        // Clear and set message
        announcer.textContent = '';
        setTimeout(() => {
            announcer.textContent = message;
        }, 100);
    }

    /**
     * Save form data to localStorage
     */
    function saveFormData(formId, inputs) {
        const data = {};
        inputs.forEach(input => {
            if (input.name && input.type !== 'password') {
                data[input.name] = input.value;
            }
        });
        localStorage.setItem(`form-data-${formId}`, JSON.stringify(data));
    }

    /**
     * Load form data from localStorage
     */
    function loadFormData(formId, inputs) {
        try {
            const savedData = localStorage.getItem(`form-data-${formId}`);
            if (savedData) {
                const data = JSON.parse(savedData);
                inputs.forEach(input => {
                    if (input.name && data[input.name] !== undefined) {
                        input.value = data[input.name];
                    }
                });
            }
        } catch (e) {
            console.warn('Error loading form data:', e);
        }
    }

    /**
     * Clear form data from localStorage
     */
    function clearFormData(formId) {
        localStorage.removeItem(`form-data-${formId}`);
    }

    /**
     * Initialize file upload enhancements
     */
    function initializeFileUploads() {
        const fileInputs = document.querySelectorAll('input[type="file"]');
        
        fileInputs.forEach(input => {
            input.addEventListener('change', function() {
                const files = Array.from(this.files);
                const fileList = files.map(file => `${file.name} (${formatFileSize(file.size)})`).join(', ');
                announceToScreenReader(`Selected files: ${fileList}`);
            });
        });
    }

    /**
     * Initialize dynamic form fields
     */
    function initializeDynamicFields() {
        // Handle conditional fields based on other selections
        const conditionalTriggers = document.querySelectorAll('[data-conditional-trigger]');
        
        conditionalTriggers.forEach(trigger => {
            trigger.addEventListener('change', function() {
                const targetSelector = this.dataset.conditionalTarget;
                const showValue = this.dataset.conditionalValue;
                const target = document.querySelector(targetSelector);
                
                if (target) {
                    if (this.value === showValue) {
                        target.style.display = 'block';
                        target.setAttribute('aria-hidden', 'false');
                    } else {
                        target.style.display = 'none';
                        target.setAttribute('aria-hidden', 'true');
                    }
                }
            });
        });
    }

    /**
     * Utility functions
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function isValidPhone(phone) {
        const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,}$/;
        return phoneRegex.test(phone);
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Export functions for external use if needed
    window.DisabilitySupportMain = {
        announceToScreenReader,
        updateCityContext,
        getCurrentCity,
        validateForm,
        performSearch
    };

})();
