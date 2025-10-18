// Store the original order of navigation items
let originalNavOrder = [];
const navList = document.getElementById('nav-list');

// Language Switching
document.getElementById('lang-en').addEventListener('click', function (event) {
    event.preventDefault();
    setLanguage('en');
    try { localStorage.setItem('bimbee_lang', 'en'); } catch {}
});

document.getElementById('lang-he').addEventListener('click', function (event) {
    event.preventDefault();
    setLanguage('he');
    try { localStorage.setItem('bimbee_lang', 'he'); } catch {}
});


window.addEventListener('DOMContentLoaded', function () {
    var navList = document.getElementById('nav-list');
    originalNavOrder = Array.from(navList.children);
    var saved = null;
    try { saved = localStorage.getItem('bimbee_lang'); } catch {}
    setLanguage(saved || window.defaultLang || 'he');
});

function setLanguage(lang) {
    var elements = document.querySelectorAll('.lang');
    elements.forEach(function (el) {
        if (el.classList.contains('lang-' + lang)) {
            el.style.display = ''; // Show the selected language
        } else {
            el.style.display = 'none'; // Hide other languages
        }
    });

    // Reorder navigation items based on the selected language
    if (lang === 'he') {
        reorderNav('rtl');
    } else {
        reorderNav('ltr');
    }

    // Notify the rest of the site (e.g., BIMblog) that the language changed
    // and expose the current language in a safe, global spot.
    try {
        window.currentLang = lang;
        window.dispatchEvent(new CustomEvent('bimbee:languagechange', { detail: { lang: lang } }));
    } catch (e) { /* no-op */ }
}

function reorderNav(direction) {
    var navList = document.getElementById('nav-list');

    // Clear the existing list and reorder based on the selected language
    navList.innerHTML = '';

    if (direction === 'rtl') {
        // Reverse the original order for RTL (Hebrew)
        originalNavOrder.slice().reverse().forEach(function (item) {
            navList.appendChild(item);
        });
    } else {
        // Restore the original order for LTR (English)
        originalNavOrder.forEach(function (item) {
            navList.appendChild(item);
        });
    }
}

// Hamburger Menu Toggle
function toggleMenu() {
    navList.classList.toggle('active');
}
function closeMenu() {
    navList.classList.remove('active');
}

// Close the menu when clicking outside of it on mobile
document.addEventListener('click', (e) => {
    const hamburger = document.querySelector('.hamburger');
    if (navList.classList.contains('active')) {
        if (!navList.contains(e.target) && !hamburger.contains(e.target)) {
            closeMenu();
        }
    }
});
// Existing code remains unchanged...
// Add lazy-loading for initial images and for dynamically added images
document.addEventListener('DOMContentLoaded', function () {
    // Set lazy-loading for images present on page load
    const addLazyAttribute = function () {
        document.querySelectorAll('img:not([loading])').forEach(function (img) {
            img.setAttribute('loading', 'lazy');
        });
    };

    addLazyAttribute();

    // Use a MutationObserver to watch for new images added to the DOM
    const observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            mutation.addedNodes.forEach(function (node) {
                // If the added node is an image, apply lazy-loading
                if (node.tagName === 'IMG') {
                    node.setAttribute('loading', 'lazy');
                }
                // If the node contains images, process them too
                else if (node.querySelectorAll) {
                    node.querySelectorAll('img:not([loading])').forEach(function (img) {
                        img.setAttribute('loading', 'lazy');
                    });
                }
            });
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });
});