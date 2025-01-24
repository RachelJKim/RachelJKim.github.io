/* 1. Toggle Hamburger Menu */
function toggleMenu() {
    const menu = document.querySelector(".menu-links");
    menu.classList.toggle("open");
}

/* 2. Hover Upon Profile Picture */

// 2.1) Preload the hover image
const hoverImg = new Image();
hoverImg.src = './assets/images/rachel/profile-pic-green-cropped.png';

// 2.2) Hover effect related functions
function handleMouseEnter() {
    body.classList.add('hover-mode');
    profilePic.src = hoverImg.src;
}

function handleMouseLeave() {
    body.classList.remove('hover-mode');
    profilePic.src = originalSrc;
}

// 2.3) Hover effect -> Click in small screens (e.g. mobile)
function handleProfileClick() {
    // If it's currently in "hover-mode", revert to original
    if (body.classList.contains('hover-mode')) {
        body.classList.remove('hover-mode');
        profilePic.src = originalSrc;
    } else {
        // Else switch to "hover-mode"
        body.classList.add('hover-mode');
        profilePic.src = hoverImg.src;
    }
}





/* Apply this to the Website */

const profilePic = document.querySelector('.profile-pic');
const body = document.body;
const originalSrc = profilePic.src;
const hoverSrc = hoverImg.src;

let lastMode = null; // keep track of the hover mode ('desktop', 'mobile')

function setupProfilePicEvents() {
    // 1) Remove all potential old listeners
    profilePic.removeEventListener('mouseenter', handleMouseEnter);
    profilePic.removeEventListener('mouseleave', handleMouseLeave);
    profilePic.removeEventListener('click', handleProfileClick);

    // 2) Determine the current mode based on width
    const currentMode = (window.innerWidth > 768) ? 'desktop' : 'mobile';

    // 3) If we are switching modes, revert the image/state to original
    if (lastMode !== currentMode) {
        body.classList.remove('hover-mode');
        profilePic.src = originalSrc;
        lastMode = currentMode; // update for next check
    }

    // 4) Attach the correct listener set for the *current* mode
    if (currentMode === 'desktop') {
        // Desktop Mode (hover)
        profilePic.addEventListener('mouseenter', handleMouseEnter);
        profilePic.addEventListener('mouseleave', handleMouseLeave);
    } else {
        // Mobile Mode (click)
        profilePic.addEventListener('click', handleProfileClick);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    setupProfilePicEvents(); // initial setup upon page load
    window.addEventListener('resize', setupProfilePicEvents); // handle dynamic resizing: change between hover<->click
});
