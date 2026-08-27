const SITE_DATA_PATH = './data/data.json';

async function loadSiteData() {
    const response = await fetch(SITE_DATA_PATH, {
        cache: 'no-store'
    });

    if (!response.ok) {
        throw new Error('data.json konnte nicht geladen werden.');
    }

    return normalizeSiteData(await response.json());
}

async function bootstrapContent() {
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
