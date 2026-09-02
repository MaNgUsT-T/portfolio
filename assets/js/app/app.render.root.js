import { normalizeSiteData } from './app.normalize.root.js';
import { renderHeader } from './app.render.header.js';
import { renderHero } from './app.render.hero.js';
import { renderAbout } from './app.render.about.js';
import { renderSkills } from './app.render.skills.js';
import { renderExperience } from './app.render.experience.js';
import { renderProjects } from './app.render.projects.js';
import { renderEducation } from './app.render.education.js';
import { renderContact } from './app.render.contact.js';
import { renderFooter } from './app.render.footer.js';

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
