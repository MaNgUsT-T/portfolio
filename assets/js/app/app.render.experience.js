import { icon } from '../shared/icons.js';
import { escapeAttribute, escapeHtml } from './app.utils.js';

// Renders the timeline from an already normalized view model.
export function renderExperience(viewModel) {
    return [
        '<section id="' + escapeAttribute(viewModel.id) + '" class="experience">',
            '<div class="container">',
                '<p class="preheader">' + escapeHtml(viewModel.preheader) + '</p>',
                '<h2>' + escapeHtml(viewModel.title) + '</h2>',
                '<div class="experience__wrapper">',
                    viewModel.items.map(function(item, index) {
                        // The first item keeps the highlighted body class from
                        // the legacy design; later entries render as cards.
                        const itemClass = index === 0 ? 'experience-item__body' : 'experience-item__card';

                        return [
                            '<div class="experience-item">',
                                '<div class="experience-item__timepoint"></div>',
                                '<div class="experience-item__date">',
                                    '<p>' + escapeHtml(item.date) + '</p>',
                                '</div>',
                                '<div class="' + itemClass + ' card card--experience-item">',
                                    '<div class="card__body">',
                                        '<div class="card__body-wrapper">',
                                            '<p>' + escapeHtml(item.date) + '</p>',
                                            '<h3>' + escapeHtml(item.title) + '</h3>',
                                            '<p class="workplace-point"><b>' + escapeHtml(item.company) + '</b><span>' + icon('location') + escapeHtml(item.location) + '</span></p>',
                                            '<ul>' + item.points.map(function(point) {
                                                return '<li>' + escapeHtml(point) + '</li>';
                                            }).join('') + '</ul>',
                                        '</div>',
                                    '</div>',
                                '</div>',
                            '</div>',
                        ].join('');
                    }).join(''),
                '</div>',
            '</div>',
        '</section>'
    ].join('');
}
