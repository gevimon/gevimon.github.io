// Store the original order of navigation items
let originalNavOrder = [];

// Language Switching
document.getElementById('lang-en').addEventListener('click', function (event) {
    event.preventDefault();
    setLanguage('en');
});

document.getElementById('lang-he').addEventListener('click', function (event) {
    event.preventDefault();
    setLanguage('he');
});


window.addEventListener('DOMContentLoaded', function () {
    var navList = document.getElementById('nav-list');
    originalNavOrder = Array.from(navList.children);
    setLanguage(window.defaultLang || 'he');
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
    var navLinks = document.querySelector('.nav-links');
    navLinks.classList.toggle('active');
}


