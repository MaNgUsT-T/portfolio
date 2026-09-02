import { icon } from '../shared/icons.js';
import { escapeAttribute, escapeHtml } from './app.utils.js';

// Renders the education carousel from an already normalized view model.
export function renderEducation(viewModel) {
    return [
        '<section class="education">',
            '<div class="container">',
                '<p class="preheader">' + escapeHtml(viewModel.preheader) + '</p>',
                '<h2>' + escapeHtml(viewModel.title) + '</h2>',
                '<div id="education-carousel" role="group" aria-label="' + escapeAttribute(viewModel.carouselLabel) + '" class="splide splide--education">',
                    '<div class="splide__track">',
                        '<ul class="splide__list">',
                            viewModel.courses.map(function(item) {
                                return [
                                    '<li class="splide__slide">',
                                        '<div class="card card--education-item">',
                                            '<div class="card__header">',
                                                '<div class="card__icon">',
                                                    icon('certificate'),
                                                '</div>',
                                            '</div>',
                                            '<div class="card__body">',
                                                '<div class="card__body-wrapper">',
                                                    '<h3>' + escapeHtml(item.title) + '</h3>',
                                                    '<p>' + escapeHtml(item.provider) + '</p>',
                                                '</div>',
                                            '</div>',
                                            '<div class="card__footer">',
                                                '<p>' + escapeHtml(item.year) + '</p>',
                                                '<p class="highlight">' + icon('verify') + escapeHtml(item.status) + '</p>',
                                            '</div>',
                                        '</div>',
                                    '</li>',
                                ].join('');
                            }).join(''),
                        '</ul>',
                    '</div>',
                    '<div class="splide__arrows">',
                        '<button class="splide__arrow splide__arrow--prev">' + icon('arrow-left') + '</button>',
                        '<button class="splide__arrow splide__arrow--next">' + icon('arrow-right') + '</button>',
                    '</div>',
                '</div>',
            '</div>',
        '</section>'
    ].join('');
}
