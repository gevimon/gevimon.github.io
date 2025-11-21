window.addEventListener("load", function () {
    const imageContainer = document.querySelector(".image-container");
    const contentContainer = document.querySelector(".content");

    if (!imageContainer || !contentContainer) {
        console.error("Missing .image-container or .content in the DOM.");
        return;
    }

    const sections = [
        "landing-page",
        "metaphor-section",
        "about-us",
        "services",
        "future-roadmap",
        "custom-plugin",
        "contact"
    ];


    const desktopImagePaths = [
        "1.jpg",
        "2.jpg",
        "3.jpg",
        "4.jpg",
        "5.jpg",
        "6.jpg",
        "7.jpg",
        "8.jpg"
    ];

    const mobileImagePaths = [
        "1.png",
        "2.png",
        "3.png",
    ];

    function updateImages() {
        const isMobile = window.matchMedia("(max-width: 768px)").matches;
        imageContainer.innerHTML = ""; // Clear existing images

        const paths = isMobile ? mobileImagePaths : desktopImagePaths;

        paths.forEach((path) => {
            const img = document.createElement("img");
            const cacheBuster = new Date().getTime();

            img.src = isMobile
                ? `images/mobile/${path}`
                : `images/desktop/${path}?${cacheBuster}`;

            img.alt = path.replace(/-/g, " ").replace(".jpg", "") + " Background";
            imageContainer.appendChild(img);
        });
    }


    function loadSections() {
        let loadedCount = 0;
        sections.forEach((section) => {
            fetch(`sections/${section}.html`)
                .then((response) => {
                    if (!response.ok) throw new Error(`Failed to load ${section}.html`);
                    return response.text();
                })
                .then((data) => {
                    const wrapper = document.createElement("div");
                    wrapper.innerHTML = data.trim();

                    const firstChild = wrapper.firstElementChild;
                    if (firstChild) {
                        contentContainer.appendChild(firstChild);
                    }
                    loadedCount++;
                    // When all sections are loaded, set the language
                    if (loadedCount === sections.length) {
                        if (typeof setLanguage === "function") {
                            const saved =
                                (typeof getStoredLanguage === 'function' && getStoredLanguage()) ||
                                window.currentLang ||
                                window.startLang ||
                                (function(){ try { return localStorage.getItem('preferredLanguage') || localStorage.getItem('bimbee_lang'); } catch { return null; } })() ||
                                window.defaultLang ||
                                'en';
                            setLanguage(saved);
                        }
                    }
                })
                .catch((error) => console.error(error));
        });
    }

    updateImages();
    loadSections();

    let resizeTimeout;

    window.addEventListener("resize", () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(updateImages, 200); // Adjust the delay as needed
    });

});
