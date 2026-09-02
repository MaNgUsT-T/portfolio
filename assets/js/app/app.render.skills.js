import { icon } from '../shared/icons.js';
import { escapeAttribute, escapeHtml } from './app.utils.js';

export function renderSkills(viewModel) {
    return [
        '<section id="' + escapeAttribute(viewModel.id) + '" class="skills">',
            '<div class="container">',
                '<p class="preheader">' + escapeHtml(viewModel.preheader) + '</p>',
                '<h2>' + escapeHtml(viewModel.title) + '</h2>',
                '<div class="skills__wrapper">',
                    viewModel.groups.map(function(group) {
                        return [
                            '<div class="card card--skill-item">',
                                '<div class="card__header">',
                                    '<div class="card__icon">' + icon(group.icon) + '</div>',
                                     '<h3>' + escapeHtml(group.title) + '</h3>',
                                '</div>',
                                '<div class="card__footer">' + group.items.map(function(item) {
                                    return '<p class="pill">' + escapeHtml(item) + '</p>';
                                }).join('') + '</div>',
                            '</div>',
                        ].join('');
                    }).join(''),
                '</div>',
            '</div>',
        '</section>'
    ].join('');
}
