// Language Switching
document.getElementById('lang-en').addEventListener('click', function (event) {
    event.preventDefault();
    setLanguage('en');
});

document.getElementById('lang-he').addEventListener('click', function (event) {
    event.preventDefault();
    setLanguage('he');
});

function setLanguage(lang) {
    var elements = document.querySelectorAll('.lang');
    elements.forEach(function (el) {
        if (el.classList.contains('lang-' + lang)) {
            el.style.display = '';  // Show the selected language
        } else {
            el.style.display = 'none';  // Hide other languages
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
    var items = Array.from(navList.children);

    // Reorder items for RTL (Hebrew) or LTR (English)
    if (direction === 'rtl') {
        items.reverse();  // Reverse the order of the items for RTL
    } else {
        items.sort();  // Keep the original order for LTR
    }

    // Clear the existing list and append the reordered items
    navList.innerHTML = '';
    items.forEach(function (item) {
        navList.appendChild(item);
    });
}

// Hamburger Menu Toggle
function toggleMenu() {
    var navLinks = document.querySelector('.nav-links');
    navLinks.classList.toggle('active');
}
