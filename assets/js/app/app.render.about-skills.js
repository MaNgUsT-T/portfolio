import { icon } from '../shared/icons.js';
import { escapeAttribute, escapeHtml } from './app.utils.js';
import { renderPicture } from './app.render.shared.js';

export function renderAbout(viewModel) {
    return [
        '<section id="' + escapeAttribute(viewModel.id) + '" class="about">',
            '<div class="container">',
                '<p class="preheader">' + escapeHtml(viewModel.preheader) + '</p>',
                '<h2>' + escapeHtml(viewModel.title) + '</h2>',
                '<div class="about__wrapper">',
                    '<div class="about__col">',
                        viewModel.paragraphs.map(function(paragraph) {
                            return '<p>' + escapeHtml(paragraph) + '</p>';
                        }).join(''),
                        '<div class="about__images">' + viewModel.images.map(renderPicture).join('') + '</div>',
                    '</div>',
                    '<div class="about__col">',
                        viewModel.cards.map(function(card) {
                            return [
                                '<div class="card card--about-item">',
                                    '<div class="card__header">',
                                        '<div class="card__icon">' + icon(card.icon) + '</div>',
                                    '</div>',
                                    '<div class="card__body">',
                                        '<div class="card__body-wrapper">',
                                            '<h3>' + escapeHtml(card.title) + '</h3>',
                                            '<p>' + escapeHtml(card.text) + '</p>',
                                        '</div>',
                                    '</div>',
                                '</div>',
                            ].join('');
                        }).join(''),
                    '</div>',
                '</div>',
            '</div>',
        '</section>'
    ].join('');
}

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
