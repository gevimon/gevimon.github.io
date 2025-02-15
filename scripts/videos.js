// Open modal and play video
function openModal(videoSrc) {
    var modal = document.getElementById("video-modal");
    var video = document.getElementById("modal-video");

    // Set the video source and load the video
    video.src = videoSrc;
    video.load();
    video.play();

    // Display the modal
    modal.style.display = "flex";
}

// Close modal and pause video
function closeModal() {
    var modal = document.getElementById("video-modal");
    var video = document.getElementById("modal-video");

    // Hide the modal and stop the video
    modal.style.display = "none";
    video.pause();
    video.src = ""; // Clear the video source to stop download
}

// Close modal when clicking outside the video
window.onclick = function (event) {
    var modal = document.getElementById("video-modal");
    if (event.target === modal) {
        closeModal();
    }
};
