/* 1. Toggle Hamburger Menu */
function toggleMenu() {
    const menu = document.querySelector(".menu-links");
    menu.classList.toggle("open");
}

/* 2. Hover Upon Profile Picture */

// 2.1) Preload the hover image
const hoverImg = new Image();
hoverImg.src = './assets/images/rachel/profile-pic-green-cropped.png';



const profilePic = document.querySelector('.profile-pic');
const body = document.body;
const originalSrc = profilePic.src;
const hoverSrc = hoverImg.src;

profilePic.addEventListener('mouseenter', () => {
    body.classList.add('hover-mode');
    profilePic.src = hoverSrc; // Change to the alternate image on hover
});

profilePic.addEventListener('mouseleave', () => {
    body.classList.remove('hover-mode');
    profilePic.src = originalSrc; // Revert to the original image when hover ends
});
