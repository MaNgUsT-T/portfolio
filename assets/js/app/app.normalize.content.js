function normalizeHeaderData(data) {
    const header = objectOrEmpty(data);

    return {
        navigation: objectArrayOrEmpty(header.navigation).map(function(item) {
            const navigationItem = objectOrEmpty(item);

            return {
                href: stringOrEmpty(navigationItem.href),
                label: stringOrEmpty(navigationItem.label),
                title: stringOrEmpty(navigationItem.title),
            };
        }),
        resumeLink: normalizeButtonLinkData(header.resumeLink, ''),
    };
}

function normalizeHeroData(data) {
    const hero = objectOrEmpty(data);

    return {
        availability: stringOrEmpty(hero.availability),
        headlineMarkup: normalizeRichText(hero.headline, ['beforeItalic', { key: 'italic', tag: 'i' }, 'afterItalic']),
        introMarkup: normalizeRichText(hero.intro, ['beforeBold', { key: 'bold', tag: 'b' }, 'afterBold']),
        buttons: objectArrayOrEmpty(hero.buttons).map(function(button) {
            return normalizeButtonLinkData(button, '');
        }),
    };
}

function normalizeAboutData(data) {
    const about = objectOrEmpty(data);
    const images = objectArrayOrEmpty(about.images).length
        ? objectArrayOrEmpty(about.images)
        : (isPlainObject(about.image) ? [about.image] : []);

    return {
        id: stringOrEmpty(about.id),
        preheader: stringOrEmpty(about.preheader),
        title: stringOrEmpty(about.title),
        paragraphs: stringArrayOrEmpty(about.paragraphs),
        images: images.map(normalizePictureData),
        cards: objectArrayOrEmpty(about.cards).map(function(card) {
            const aboutCard = objectOrEmpty(card);

            return {
                title: stringOrEmpty(aboutCard.title),
                text: stringOrEmpty(aboutCard.text),
                icon: stringOrEmpty(aboutCard.icon),
            };
        }),
    };
}

function normalizeSkillsData(data) {
    const skillsSection = objectOrEmpty(data);
    const groups = objectArrayOrEmpty(skillsSection.skills).length
        ? objectArrayOrEmpty(skillsSection.skills)
        : objectArrayOrEmpty(skillsSection.groups);

    return {
        id: stringOrEmpty(skillsSection.id),
        preheader: stringOrEmpty(skillsSection.preheader),
        title: stringOrEmpty(skillsSection.title),
        groups: groups.map(function(group) {
            const skillGroup = objectOrEmpty(group);

            return {
                title: stringOrEmpty(skillGroup.title),
                icon: stringOrEmpty(skillGroup.icon),
                items: stringArrayOrEmpty(skillGroup.items),
            };
        }),
    };
}

function normalizeExperienceData(data) {
    const experienceSection = objectOrEmpty(data);
    const items = objectArrayOrEmpty(experienceSection.experience).length
        ? objectArrayOrEmpty(experienceSection.experience)
        : objectArrayOrEmpty(experienceSection.items);

    return {
        id: stringOrEmpty(experienceSection.id),
        preheader: stringOrEmpty(experienceSection.preheader),
        title: stringOrEmpty(experienceSection.title),
        items: items.map(function(item) {
            const experienceItem = objectOrEmpty(item);

            return {
                date: stringOrEmpty(experienceItem.date),
                title: stringOrEmpty(experienceItem.title),
                company: stringOrEmpty(experienceItem.company),
                location: stringOrEmpty(experienceItem.location),
                points: stringArrayOrEmpty(experienceItem.points),
            };
        }),
    };
}

function normalizeProjectsData(data) {
    const projectsSection = objectOrEmpty(data);
    const items = objectArrayOrEmpty(projectsSection.projects).length
        ? objectArrayOrEmpty(projectsSection.projects)
        : objectArrayOrEmpty(projectsSection.items);

    return {
        id: stringOrEmpty(projectsSection.id),
        preheader: stringOrEmpty(projectsSection.preheader),
        title: stringOrEmpty(projectsSection.title),
        items: items.map(function(item) {
            const project = objectOrEmpty(item);

            return {
                category: stringOrEmpty(project.category),
                href: stringOrEmpty(project.href),
                title: stringOrEmpty(project.title),
                description: stringOrEmpty(project.description),
                highlight: stringOrEmpty(project.highlight),
                tags: stringArrayOrEmpty(project.tags),
                image: normalizePictureData(project.image),
            };
        }),
    };
}

function normalizeEducationData(data) {
    const educationSection = objectOrEmpty(data);
    const items = objectArrayOrEmpty(educationSection.courses).length
        ? objectArrayOrEmpty(educationSection.courses)
        : objectArrayOrEmpty(educationSection.items);

    return {
        preheader: stringOrEmpty(educationSection.preheader),
        title: stringOrEmpty(educationSection.title),
        carouselLabel: stringOrEmpty(educationSection.carouselLabel),
        courses: items.map(function(item) {
            const course = objectOrEmpty(item);

            return {
                title: stringOrEmpty(course.title),
                provider: stringOrEmpty(course.provider),
                year: stringOrEmpty(course.year),
                status: stringOrEmpty(course.status),
            };
        }),
    };
}
