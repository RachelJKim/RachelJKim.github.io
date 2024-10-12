function toggleMenu() {
    const menu = document.querySelector(".menu-links");
    const icon = document.querySelector(".hamburger-icon");
    menu.classList.toggle("open");
    icon.classList.toggle("open");
}

/* 2. Hover Upon Profile Picture */
const profilePic = document.querySelector('.profile-pic');
const body = document.body;
const originalSrc = profilePic.src;
const hoverSrc = './assets/images/rachel/profile-pic-green-cropped.png'

profilePic.addEventListener('mouseenter', () => {
    body.classList.add('hover-mode');
    profilePic.src = hoverSrc; // Change to the alternate image on hover
});

profilePic.addEventListener('mouseleave', () => {
    body.classList.remove('hover-mode');
    profilePic.src = originalSrc; // Revert to the original image when hover ends
});
