function toggleMenu() {
    const menu = document.querySelector(".menu-links");
    const icon = document.querySelector(".hamburger-icon");
    menu.classList.toggle("open");
    icon.classList.toggle("open");
}

// // script.js or inline in <script> tags
// function toggleMenu() {
//     const menuLinks = document.querySelector('#hamburger-nav .menu-links');
//     menuLinks.classList.toggle('active');
// }
