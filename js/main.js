/*
 * Header scrolled
*/

window.addEventListener('scroll', function() {
    const header = document.querySelector('header');
    if (window.scrollY > 88) {
        header.classList.add('header--scrolled');
    } else {
        header.classList.remove('header--scrolled');
    }
});

document.addEventListener('DOMContentLoaded', function () {
    var splide = new Splide('.splide', {
        type: 'loop',


    });
    splide.mount();
});
