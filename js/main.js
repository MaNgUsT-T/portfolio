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

/* ==========================================================================
 * Splide.js Carousels
 * ========================================================================== */

// Native Zählung der Education-Slides per Vanilla JS.
let educationCarouselItems = document.querySelectorAll('#education-carousel .splide__slide').length;
console.log('Education Items:', educationCarouselItems);

/**
 * Initialisiert das "Education"-Carousel mittels Splide.js.
 * Funktioniert nach dem gleichen Prinzip wie das Demo-Carousel.
 */
function educationCarouselInitialize() {
    if (educationCarouselItems > 0) {
        const educationItemList = new Splide('#education-carousel', {
            type: 'loop',
            perPage: 1,
            perMove: 1,
            gap: '4rem',
            destroy: 1 >= educationCarouselItems,
            mediaQuery: 'min',
            breakpoints: {
                768: {
                    perPage: 2,
                    perMove: 2,
                    destroy: 2 >= educationCarouselItems
                },
                1200: {
                    perPage: 4,
                    perMove: 4,
                    destroy: 4 >= educationCarouselItems
                }
            }
        });
        educationItemList.mount();
    }
}

/* ==========================================================================
 * Initialisierung bei Document Ready (Natives JavaScript)
 * ========================================================================== */

// Der DOMContentLoaded-Event-Listener ist die native Alternative zu $(document).ready()
// Er wartet, bis die HTML-Struktur vollständig geladen ist, bevor Funktionen ausgeführt werden.
document.addEventListener('DOMContentLoaded', function() {
    educationCarouselInitialize();
});






