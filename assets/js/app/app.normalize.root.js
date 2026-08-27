import { objectOrEmpty } from './app.utils.js';
import {
    normalizeHeaderData,
    normalizeHeroData,
    normalizeAboutData,
    normalizeSkillsData,
    normalizeExperienceData,
    normalizeProjectsData,
    normalizeEducationData,
} from './app.normalize.content.js';
import { normalizeContactData, normalizeFooterData } from './app.normalize.contact.js';
import { normalizeMetaData, normalizeSiteConfig } from './app.normalize.meta.js';

export function normalizeSiteData(data) {
    const siteData = objectOrEmpty(data);

    return {
        meta: normalizeMetaData(siteData.meta),
        siteConfig: normalizeSiteConfig(siteData),
        header: normalizeHeaderData(siteData.header),
        hero: normalizeHeroData(siteData.hero),
        about: normalizeAboutData(siteData.about),
        skills: normalizeSkillsData(siteData.skills),
        experience: normalizeExperienceData(siteData.experience),
        projects: normalizeProjectsData(siteData.projects),
        education: normalizeEducationData(siteData.education),
        contact: normalizeContactData(siteData.contact),
        footer: normalizeFooterData(siteData.footer),
    };
}
