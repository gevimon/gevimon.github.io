window.onload = function() {
    const imageContainer = document.querySelector('.image-container');
    const imagePaths = [
        "landing-background.jpg",
        "about-background.jpg",
        "services-background.jpg",
        "plugin-background.jpg",        
        "future-roadmap-background.jpg",
        "custom-plugin-background.jpg",
        "contact-background.jpg"
    ];

    // Clear existing images
    imageContainer.innerHTML = '';

    // Append images dynamically
    imagePaths.forEach(path => {
        const img = document.createElement('img');
        img.src = `images/${path}`;
        img.alt = path.split('-').join(' ').replace('.jpg', '') + ' Background';
        imageContainer.appendChild(img);
    });

    // Load content sections
    const contentContainer = document.querySelector('.content');
    const sections = [
        'landing-page',
        'metaphor-section',
        'about-us',
        'services',
        'future-roadmap',
        'custom-plugin',
        'contact'
    ];

    sections.forEach(section => {
        fetch(`sections/${section}.html`)
            .then(response => response.text())
            .then(data => {
                const wrapper = document.createElement('div');
                wrapper.innerHTML = data;
                contentContainer.appendChild(wrapper.firstChild);
            });
    });
}