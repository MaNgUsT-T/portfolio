import { normalizeSiteData } from './app.normalize.root.js';
import { renderAbout, renderSkills } from './app.render.about-skills.js';
import { renderEducation, renderContact, renderFooter } from './app.render.education-contact.js';
import { renderExperience, renderProjects } from './app.render.experience-projects.js';
import { renderHeader, renderHero } from './app.render.header-hero.js';

// Composes the full page from normalized section view models in the same order
// that the static template and navigation expect.
export function renderApp(data) {
    const siteData = normalizeSiteData(data);

    return [
        renderHeader(siteData.header, siteData.siteConfig),
        '<main>',
        renderHero(siteData.hero, siteData.siteConfig),
        renderAbout(siteData.about),
        renderSkills(siteData.skills),
        renderExperience(siteData.experience),
        renderProjects(siteData.projects),
        renderEducation(siteData.education),
        renderContact(siteData.contact),
        '</main>',
        renderFooter(siteData.footer, siteData.siteConfig),
        '<div class="backdrop" data-overlay></div>'
    ].join('');
}
