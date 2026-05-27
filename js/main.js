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

/*
 * Education carousel
*/

document.addEventListener( 'DOMContentLoaded', function () {
    new Splide( '#education-carousel', {
        type   : 'loop',
        perPage: 1,
        perMove: 1,
        gap: '2.4rem',
        mediaQuery: 'min',
        breakpoints: {
            768: {
                perPage: 2,
            },
            1024: {
                perPage: 4,
            },
        }
    } ).mount();
} );
