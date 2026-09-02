import { normalizeSiteData } from './app.normalize.root.js';
import { applyMeta } from './app.meta.js';
import { renderAbout } from './app.render.about.js';
import { renderContact } from './app.render.contact.js';
import { renderEducation } from './app.render.education.js';
import { renderExperience } from './app.render.experience.js';
import { renderFooter } from './app.render.footer.js';
import { renderHeader } from './app.render.header.js';
import { renderHero } from './app.render.hero.js';
import { renderProjects } from './app.render.projects.js';
import { renderSkills } from './app.render.skills.js';

const SITE_DATA_PATH = './data/data.json';

export async function loadSiteData() {
    const response = await fetch(SITE_DATA_PATH, {
        cache: 'no-store'
    });

    if (!response.ok) {
        throw new Error('data.json konnte nicht geladen werden.');
    }

    return normalizeSiteData(await response.json());
}

export async function bootstrapContent() {
    const siteData = await loadSiteData();
    const root = document.querySelector('[data-site-root]');

    if (!root) {
        return;
    }

    applyMeta(siteData.meta);
    root.innerHTML = [
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
