function getSlideCount(selector) {
    return document.querySelectorAll(selector + ' .splide__slide').length;
}

function initializeCarousel(selector) {
    const slideCount = getSlideCount(selector);

    if (slideCount <= 0) {
        return;
    }

    new Splide(selector, {
        type: 'loop',
        perPage: 1,
        perMove: 1,
        gap: '4rem',
        destroy: 1 >= slideCount,
        mediaQuery: 'min',
        breakpoints: {
            768: {
                perPage: 2,
                perMove: 2,
                destroy: 2 >= slideCount
            },
            1200: {
                perPage: 4,
                perMove: 4,
                destroy: 4 >= slideCount
            }
        }
    }).mount();
}

export function demoCarouselInitialize() {
    initializeCarousel('#splide-carousel');
}

export function educationCarouselInitialize() {
    initializeCarousel('#education-carousel');
}
