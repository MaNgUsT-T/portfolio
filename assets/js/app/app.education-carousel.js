function educationCarouselInitialize() {
    const itemCount = document.querySelectorAll('#education-carousel .splide__slide').length;

    if (itemCount <= 0) {
        return;
    }

    new Splide('#education-carousel', {
        type: 'loop',
        perPage: 1,
        perMove: 1,
        gap: '4rem',
        destroy: 1 >= itemCount,
        mediaQuery: 'min',
        breakpoints: {
            768: {
                perPage: 2,
                perMove: 2,
                destroy: 2 >= itemCount
            },
            1200: {
                perPage: 4,
                perMove: 4,
                destroy: 4 >= itemCount
            }
        }
    }).mount();
}
