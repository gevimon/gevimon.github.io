// scripts/videos.js
// Now accepts a title and displays it
function openModal(videoSrc, videoTitle, descriptionId) {
    var modal = document.getElementById("video-modal");
    var video = document.getElementById("modal-video");
    var title = document.getElementById("modal-title");
    var description = document.getElementById("modal-description");

    title.textContent = videoTitle;
    var descElem = document.getElementById(descriptionId);
    description.innerHTML = descElem ? descElem.innerHTML : "";
    video.src = videoSrc;
    video.load();
    video.play();
    modal.style.display = "flex";
}

function closeModal() {
    var modal = document.getElementById("video-modal");
    var video = document.getElementById("modal-video");

    modal.style.display = "none";
    if (video) {
        fadeOutVideoAudio(video);
    }
    // video.pause();
    // video.src = "";
}

window.onclick = function (event) {
    var modal = document.getElementById("video-modal");
    if (event.target === modal) {
        closeModal();
    }
}

function getCurrentLang() {
    // Detects current language by checking which .lang element is visible
    var heElem = document.querySelector('.lang.lang-he');
    if (heElem && heElem.style.display !== 'none') {
        return 'he';
    }
    return 'en';
}

function openPluginModal(plugin) {
    var lang = getCurrentLang();
    var videoSrc, videoTitle, descriptionId;

    if (plugin === 'fabpackager') {
        videoSrc = 'videos/fabrication-packager.mp4';
        videoTitle = lang === 'he' ? 'סקירת תוסף FabPackager' : 'Fabrication Packager Plugin Review';
        descriptionId = lang === 'he' ? 'fabpackager-vid-description-he' : 'fabpackager-vid-description-en';
    } else if (plugin === 'bimchecker') {
        videoSrc = 'videos/bim-checker.mp4';
        videoTitle = lang === 'he' ? 'תוסף BIMChecker' : 'BIM Checker Plugin';
        descriptionId = lang === 'he' ? 'bimchecker-desc-he' : 'bimchecker-desc-en';
    } else if (plugin === 'drawingcreator') {
        videoSrc = 'videos/drawing-creator.mp4';
        videoTitle = lang === 'he' ? 'תוסף DrawingCreator' : 'Drawing Creator Plugin';
        descriptionId = lang === 'he' ? 'drawingcreator-desc-he' : 'drawingcreator-desc-en';
    } else if (plugin === 'promo') {
        videoSrc = 'videos/promo.mp4';
        videoTitle = lang === 'he' ? 'הסבר על BIMbee וכל התוספים' : 'BIMbee Overview & Plugins Promo';
        descriptionId = lang === 'he' ? 'promo-desc-he' : 'promo-desc-en';
    } else {
        return;
    }
    openModal(videoSrc, videoTitle, descriptionId);
}

function fadeOutVideoAudio(video, duration = 1700) {
    if (!video) return;
    const initialVolume = video.volume;
    const steps = 20;
    const stepTime = duration / steps;
    let currentStep = 0;

    function fade() {
        currentStep++;
        video.volume = Math.max(0, initialVolume * (1 - currentStep / steps));
        if (currentStep < steps) {
            setTimeout(fade, stepTime);
        } else {
            video.pause();
            video.volume = initialVolume; // Reset for next play
        }
    }
    fade();
}

// Add event delegation for links inside the modal description
document.addEventListener('DOMContentLoaded', function () {
    var modalDescription = document.getElementById('modal-description');
    if (modalDescription) {
        modalDescription.addEventListener('click', function (e) {
            var target = e.target;
            // Check if the clicked element is a link
            if (target.tagName === 'A' && target.target === '_blank') {
                var video = document.getElementById("modal-video");
                if (video) {
                    fadeOutVideoAudio(video);
                }
                // Let the default behavior (open in new tab) continue
            }
        });
    }
});
