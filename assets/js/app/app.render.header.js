import { icon } from '../shared/icons.js';
import { escapeAttribute, escapeHtml } from './app.utils.js';

export function renderHeader(viewModel, siteConfig) {
    return [
        '<header class="header js-header">',
            '<div class="container header__wrapper">',
                '<div class="logo">' + icon(siteConfig.logoIcon) + '<span>' + escapeHtml(siteConfig.logoText) + '</span></div>',
                '<div id="header-navigation" aria-hidden="true" class="header__nav-wrapper js-header-nav-wrapper">',
                    '<nav role="navigation" aria-label="Navigation" class="main-nav">',
                        '<ul>',
                            viewModel.navigation.map(function(item) {
                                const title = item.title !== '' ? ' title="' + escapeAttribute(item.title) + '"' : '';

                                return [
                                    '<li><a href="' + escapeAttribute(item.href) + '"' + title + '>' + escapeHtml(item.label) + '</a></li>',
                                ].join('');
                            }).join(''),
                        '</ul>',
                    '</nav>',
                    '<nav class="option-nav">',
                        '<ul>',
                            '<li><a href="#" title="Dunkles Theme aktivieren" aria-label="Dunkles Theme aktivieren" aria-pressed="false" data-theme-toggle>' + icon('moon') + '</a></li>',
                            '<li><a href="' + escapeAttribute(viewModel.resumeLink.href) + '" class="btn btn--primary">' +
                                escapeHtml(viewModel.resumeLink.label) + '</a></li>',
                        '</ul>',
                    '</nav>',
                '</div>',
                '<div role="button" aria-expanded="false" aria-controls="header-navigation" aria-label="Navigation öffnen" tabindex="0" class="mobile-nav-toggle" data-mobile-nav-toggle>' + icon('menu') + '</div>',
            '</div>',
        '</header>'
    ].join('');
}
