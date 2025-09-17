// scripts/videos.js
// Now accepts a title and displays it
function openModal(videoSrc, videoTitle) {
    var modal = document.getElementById("video-modal");
    var video = document.getElementById("modal-video");
    var title = document.getElementById("modal-title");

    title.textContent = videoTitle;
    video.src = videoSrc;
    video.load();
    video.play();
    modal.style.display = "flex";
}

function closeModal() {
    var modal = document.getElementById("video-modal");
    var video = document.getElementById("modal-video");

    modal.style.display = "none";
    video.pause();
    video.src = "";
}

window.onclick = function (event) {
    var modal = document.getElementById("video-modal");
    if (event.target === modal) {
        closeModal();
    }
};
