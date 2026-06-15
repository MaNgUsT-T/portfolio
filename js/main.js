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
 * Carousel
 *
*/

let educationCarouselItems = document.querySelectorAll('#education-carousel .splide__slide').length;
console.log('Education Items:', educationCarouselItems);

document.addEventListener( 'DOMContentLoaded', function () {
    new Splide( '#education-carousel', {
        type: 'loop',
        perPage: 1,
        perMove: 1,
        gap: '2.4rem',
        destroy: 1 >= educationCarouselItems ? true : false,
        mediaQuery: 'min',
        breakpoints: {
            768: {
                perPage: 2,
                perMove: 2,
                destroy: 2 >= educationCarouselItems ? true : false
            },
            1024: {
                perPage: 4,
                perMove: 4,
                destroy: 4 >= educationCarouselItems ? true : false
            }
        }
    } ).mount();
} );







