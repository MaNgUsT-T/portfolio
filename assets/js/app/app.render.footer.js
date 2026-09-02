import { icon } from '../shared/icons.js';
import { escapeHtml } from './app.utils.js';
import { renderSocialLinks } from './app.render.shared.js';

export function renderFooter(viewModel, siteConfig) {
    return [
        '<footer class="footer">',
            '<div class="container footer__wrapper">',
                '<div class="logo">' + icon(siteConfig.logoIcon) + '<span>' + escapeHtml(siteConfig.logoText) + '</span></div>',
                '<p>' + escapeHtml(viewModel.text) + ' <span class="text-nowrap">&copy; ' + escapeHtml(viewModel.copyright) + '</span> ' + escapeHtml(viewModel.owner) + '</p>',
                '<div class="social-icons">' + renderSocialLinks(siteConfig.socialLinks) + '</div>',
            '</div>',
        '</footer>'
    ].join('');
}
