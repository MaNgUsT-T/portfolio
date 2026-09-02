import { escapeHtml } from './app.utils.js';
import { renderButtonLink, renderSocialLinks } from './app.render.shared.js';

export function renderHero(viewModel, siteConfig) {
    return [
        '<section id="hero" class="hero">',
            '<div class="container hero__wrapper">',
                '<div class="hero__col">',
                    '<p class="availability">' + escapeHtml(viewModel.availability) + '</p>',
                    '<h1>' + viewModel.headlineMarkup + '</h1>',
                    '<p>' + viewModel.introMarkup + '</p>',
                    viewModel.buttons.length ? '<div class="hero__buttons">' + viewModel.buttons.map(renderButtonLink).join('') + '</div>' : '',
                    '<div class="social-icons">' + renderSocialLinks(siteConfig.socialLinks) + '</div>',
                '</div>',
                '<div class="hero__col">',
                    '<div>',
                        '<div class="hero-element"></div>',
                        '<div class="hero-element"><div></div><div></div><div></div><div><span></span><span></span></div></div>',
                        '<div class="hero-element"><div><div></div><div><div></div><div></div></div></div><div></div><div></div><div></div></div>',
                        '<div class="hero-element"></div>',
                    '</div>',
                '</div>',
            '</div>',
        '</section>'
    ].join('');
}
