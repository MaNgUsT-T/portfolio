// @prepros-prepend all.js
/**
 * @fileoverview Haupt-JavaScript-Datei für das Frontend.
 * Lädt die Portfoliodaten aus data.json, rendert die Seite und initialisiert
 * danach Theme, Navigation, Carousel und Kontaktformular.
 */

const SITE_DATA_PATH = './data/data.json';

function isPlainObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function objectOrEmpty(value) {
    return isPlainObject(value) ? value : {};
}

function arrayOrEmpty(value) {
    return Array.isArray(value) ? value : [];
}

function stringOrEmpty(value) {
    return typeof value === 'string' ? value : '';
}

function booleanOrFalse(value) {
    return value === true;
}

function numberOrEmpty(value) {
    return typeof value === 'number' && Number.isFinite(value) ? String(value) : stringOrEmpty(value);
}

function objectArrayOrEmpty(value) {
    return arrayOrEmpty(value).map(function(item) {
        return objectOrEmpty(item);
    });
}

function stringArrayOrEmpty(value) {
    return arrayOrEmpty(value).filter(function(item) {
        return typeof item === 'string';
    });
}

function normalizeButtonVariant(value) {
    const variant = stringOrEmpty(value);

    if (variant === '') {
        return 'btn--primary';
    }

    if (variant === 'primary' || variant === 'secondary' || variant === 'danger') {
        return 'btn--' + variant;
    }

    return variant;
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function escapeAttribute(value) {
    return escapeHtml(value);
}

function normalizeRichText(value, segments) {
    if (typeof value === 'string') {
        return value;
    }

    const richText = objectOrEmpty(value);

    return segments.map(function(segment) {
        if (typeof segment === 'string') {
            return escapeHtml(stringOrEmpty(richText[segment]));
        }

        return '<' + segment.tag + '>' + escapeHtml(stringOrEmpty(richText[segment.key])) + '</' + segment.tag + '>';
    }).join('');
}

function normalizePictureData(image) {
    const imageData = objectOrEmpty(image);
    const fallbackImage = objectOrEmpty(imageData.fallback);
    const responsiveSources = objectArrayOrEmpty(imageData.responsive).length
        ? objectArrayOrEmpty(imageData.responsive)
        : objectArrayOrEmpty(imageData.sources);

    return {
        src: stringOrEmpty(imageData.src) || stringOrEmpty(fallbackImage.src),
        width: numberOrEmpty(imageData.width) || numberOrEmpty(fallbackImage.width),
        height: numberOrEmpty(imageData.height) || numberOrEmpty(fallbackImage.height),
        alt: stringOrEmpty(imageData.alt),
        loading: stringOrEmpty(imageData.loading),
        className: stringOrEmpty(imageData.className),
        responsive: responsiveSources.map(function(source) {
            const sourceData = objectOrEmpty(source);

            return {
                media: stringOrEmpty(sourceData.media),
                srcset: stringOrEmpty(sourceData.srcset),
                width: numberOrEmpty(sourceData.width),
                height: numberOrEmpty(sourceData.height),
            };
        }),
    };
}

function normalizeSocialLinkData(item) {
    const link = objectOrEmpty(item);

    return {
        href: stringOrEmpty(link.href),
        title: stringOrEmpty(link.title),
        icon: stringOrEmpty(link.icon),
    };
}

function normalizeButtonLinkData(button, fallbackLabel) {
    const buttonData = objectOrEmpty(button);

    return {
        href: stringOrEmpty(buttonData.href) || '#',
        label: stringOrEmpty(buttonData.label) || stringOrEmpty(fallbackLabel),
        variant: normalizeButtonVariant(buttonData.variant),
        large: booleanOrFalse(buttonData.large),
        icon: stringOrEmpty(buttonData.icon),
    };
}

function normalizeButtonElementData(button, fallbackLabel) {
    const buttonData = normalizeButtonLinkData(button, fallbackLabel);

    return {
        label: buttonData.label,
        variant: buttonData.variant,
        large: buttonData.large,
        icon: buttonData.icon,
    };
}

function normalizeSiteConfig(data) {
    const site = objectOrEmpty(data.site);
    const header = objectOrEmpty(data.header);
    const footer = objectOrEmpty(data.footer);
    const hero = objectOrEmpty(data.hero);
    const socialLinks = objectArrayOrEmpty(site.socialLinks).length
        ? objectArrayOrEmpty(site.socialLinks)
        : objectArrayOrEmpty(hero.socialLinks).length
            ? objectArrayOrEmpty(hero.socialLinks)
            : objectArrayOrEmpty(footer.socialLinks);

    return {
        logoIcon: stringOrEmpty(site.logoIcon) || stringOrEmpty(header.logoIcon) || 'palette',
        logoText: stringOrEmpty(site.logoText) || stringOrEmpty(header.logoText) || stringOrEmpty(footer.logoText) || 'lisa.weber',
        socialLinks: socialLinks.map(normalizeSocialLinkData),
    };
}

function normalizeMetaData(data) {
    const meta = objectOrEmpty(data);

    return {
        title: stringOrEmpty(meta.title),
        description: stringOrEmpty(meta.description),
        keywords: stringOrEmpty(meta.keywords),
        ogTitle: stringOrEmpty(meta.ogTitle),
        ogDescription: stringOrEmpty(meta.ogDescription),
        ogImage: stringOrEmpty(meta.ogImage),
        ogSiteName: stringOrEmpty(meta.ogSiteName),
        fluidIconTitle: stringOrEmpty(meta.fluidIconTitle),
    };
}

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

function normalizeContactOptionData(option) {
    const optionData = objectOrEmpty(option);

    return {
        id: stringOrEmpty(optionData.id),
        value: stringOrEmpty(optionData.value),
        label: stringOrEmpty(optionData.label),
        selected: booleanOrFalse(optionData.selected),
    };
}

function normalizeContactFieldData(field) {
    const fieldConfig = objectOrEmpty(field);
    const options = objectArrayOrEmpty(fieldConfig.options).map(normalizeContactOptionData);

    return {
        type: stringOrEmpty(fieldConfig.type) || 'text',
        id: stringOrEmpty(fieldConfig.id),
        name: stringOrEmpty(fieldConfig.name),
        label: stringOrEmpty(fieldConfig.label),
        placeholder: stringOrEmpty(fieldConfig.placeholder),
        rows: numberOrEmpty(fieldConfig.rows),
        required: booleanOrFalse(fieldConfig.required),
        row: booleanOrFalse(fieldConfig.row),
        wrapperClass: stringOrEmpty(fieldConfig.wrapperClass) || 'form-group',
        maxLength: typeof fieldConfig.maxLength === 'number' ? fieldConfig.maxLength : null,
        errorRequired: stringOrEmpty(fieldConfig.errorRequired),
        errorTooLong: stringOrEmpty(fieldConfig.errorTooLong),
        errorInvalid: stringOrEmpty(fieldConfig.errorInvalid),
        value: stringOrEmpty(fieldConfig.value),
        options: options,
    };
}

function normalizeContactData(data) {
    const contact = objectOrEmpty(data);
    const introCard = objectOrEmpty(contact.introCard);
    const form = objectOrEmpty(contact.form);

    return {
        id: stringOrEmpty(contact.id),
        preheader: stringOrEmpty(contact.preheader),
        title: stringOrEmpty(contact.title),
        introCard: {
            title: stringOrEmpty(introCard.title),
            text: stringOrEmpty(introCard.text),
            linkLabel: stringOrEmpty(introCard.linkLabel) || 'E-Mail senden',
        },
        form: {
            action: stringOrEmpty(form.action) || './contact.php',
            fields: objectArrayOrEmpty(form.fields).map(normalizeContactFieldData),
            submitButton: normalizeButtonElementData(form.submitButton, stringOrEmpty(form.submitLabel)),
        },
    };
}

function normalizeFooterData(data) {
    const footer = objectOrEmpty(data);

    return {
        text: stringOrEmpty(footer.text),
        copyright: stringOrEmpty(footer.copyright),
        owner: stringOrEmpty(footer.owner),
    };
}

function normalizeSiteData(data) {
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

function renderPicture(image) {
    return [
        '<picture>',
        image.responsive.map(function(source) {
            return [
                '<source media="' + escapeAttribute(source.media) + '" srcset="' + escapeAttribute(source.srcset) +
                    '" width="' + escapeAttribute(source.width) + '" height="' + escapeAttribute(source.height) + '">',
            ].join('');
        }).join(''),
        '<img src="' + escapeAttribute(image.src) + '" width="' + escapeAttribute(image.width) +
            '" height="' + escapeAttribute(image.height) + '" alt="' + escapeAttribute(image.alt) +
            '" loading="' + escapeAttribute(image.loading) + '" class="' + escapeAttribute(image.className) + '">',
        '</picture>'
    ].join('');
}

function renderSocialLinks(items) {
    return items.map(function(item) {
        return [
            '<a href="' + escapeAttribute(item.href) + '" title="' + escapeAttribute(item.title) + '">',
            icon(item.icon),
            '</a>',
        ].join('');
    }).join('');
}

function renderButtonLink(button) {
    const classNames = ['btn', button.variant];

    if (button.large) {
        classNames.push('btn--large');
    }

    return [
        '<a href="' + escapeAttribute(button.href) + '" class="' + escapeAttribute(classNames.join(' ')) + '">',
        escapeHtml(button.label),
        button.icon !== '' ? icon(button.icon) : '',
        '</a>',
    ].join('');
}

function renderButtonElement(button, attributes) {
    const classNames = ['btn', button.variant || 'btn--primary'];
    const htmlAttributes = Array.isArray(attributes) ? attributes.slice() : [];

    if (button.large) {
        classNames.push('btn--large');
    }

    htmlAttributes.push('class="' + escapeAttribute(classNames.join(' ')) + '"');

    return [
        '<button ' + htmlAttributes.join(' ') + '>',
            escapeHtml(button.label),
            button.icon !== '' ? icon(button.icon) : '',
        '</button>',
    ].join('');
}

function renderHeader(viewModel, siteConfig) {
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

function renderHero(viewModel, siteConfig) {
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

function renderAbout(viewModel) {
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

function renderSkills(viewModel) {
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

function renderExperience(viewModel) {
    return [
        '<section id="' + escapeAttribute(viewModel.id) + '" class="experience">',
            '<div class="container">',
                '<p class="preheader">' + escapeHtml(viewModel.preheader) + '</p>',
                '<h2>' + escapeHtml(viewModel.title) + '</h2>',
                '<div class="experience__wrapper">',
                    viewModel.items.map(function(item, index) {
                        const itemClass = index === 0 ? 'experience-item__body' : 'experience-item__card';

                        return [
                            '<div class="experience-item">',
                                '<div class="experience-item__timepoint"></div>',
                                '<div class="experience-item__date">',
                                    '<p>' + escapeHtml(item.date) + '</p>',
                                '</div>',
                                '<div class="' + itemClass + ' card card--experience-item">',
                                    '<div class="card__body">',
                                        '<div class="card__body-wrapper">',
                                            '<p>' + escapeHtml(item.date) + '</p>',
                                            '<h3>' + escapeHtml(item.title) + '</h3>',
                                            '<p class="workplace-point"><b>' + escapeHtml(item.company) + '</b><span>' + icon('location') + escapeHtml(item.location) + '</span></p>',
                                            '<ul>' + item.points.map(function(point) {
                                                return '<li>' + escapeHtml(point) + '</li>';
                                            }).join('') + '</ul>',
                                        '</div>',
                                    '</div>',
                                '</div>',
                            '</div>',
                        ].join('');
                    }).join(''),
                '</div>',
            '</div>',
        '</section>'
    ].join('');
}

function renderProjects(viewModel) {
    return [
        '<section id="' + escapeAttribute(viewModel.id) + '" class="projects">',
            '<div class="container">',
                '<p class="preheader">' + escapeHtml(viewModel.preheader) + '</p>',
                '<h2>' + escapeHtml(viewModel.title) + '</h2>',
                '<div class="projects__wrapper">',
                    viewModel.items.map(function(item) {
                        return [
                            '<article class="card card--project-item">',
                                '<figure>',
                                    renderPicture(item.image),
                                    '<figcaption class="pill">' + escapeHtml(item.category) + '</figcaption>',
                                '</figure>',
                                '<div class="card__body">',
                                    '<div class="card__body-wrapper">',
                                        '<a href="' + escapeAttribute(item.href) + '">',
                                            '<h3>' + escapeHtml(item.title) + '<span>' + icon('externalLink') + '</span></h3>' +
                                        '</a>',
                                        '<p>' + escapeHtml(item.description) + '</p>',
                                        '<p class="highlight">' + icon('arrow-right') + escapeHtml(item.highlight) + '</p>',
                                    '</div>',
                                '</div>',
                                '<div class="card__footer">',
                                    item.tags.map(function(tag) {
                                        return '<p class="pill">' + escapeHtml(tag) + '</p>';
                                    }).join(''),
                                '</div>',
                            '</article>',
                        ].join('');
                    }).join(''),
                '</div>',
            '</div>',
        '</section>'
    ].join('');
}

function renderEducation(viewModel) {
    return [
        '<section class="education">',
            '<div class="container">',
                '<p class="preheader">' + escapeHtml(viewModel.preheader) + '</p>',
                '<h2>' + escapeHtml(viewModel.title) + '</h2>',
                '<div id="education-carousel" role="group" aria-label="' + escapeAttribute(viewModel.carouselLabel) + '" class="splide splide--education">',
                    '<div class="splide__track">',
                        '<ul class="splide__list">',
                            viewModel.courses.map(function(item) {
                                return [
                                    '<li class="splide__slide">',
                                        '<div class="card card--education-item">',
                                            '<div class="card__header">',
                                                '<div class="card__icon">',
                                                    icon('certificate'),
                                                '</div>',
                                            '</div>',
                                            '<div class="card__body">',
                                                '<div class="card__body-wrapper">',
                                                    '<h3>' + escapeHtml(item.title) + '</h3>',
                                                    '<p>' + escapeHtml(item.provider) + '</p>',
                                                '</div>',
                                            '</div>',
                                            '<div class="card__footer">',
                                                '<p>' + escapeHtml(item.year) + '</p>',
                                                '<p class="highlight">' + icon('verify') + escapeHtml(item.status) + '</p>',
                                            '</div>',
                                        '</div>',
                                    '</li>',
                                ].join('');
                            }).join(''),
                        '</ul>',
                    '</div>',
                    '<div class="splide__arrows">',
                        '<button class="splide__arrow splide__arrow--prev">' + icon('arrow-right') + '</button>',
                        '<button class="splide__arrow splide__arrow--next">' + icon('arrow-right') + '</button>',
                    '</div>',
                '</div>',
            '</div>',
        '</section>'
    ].join('');
}

function renderField(viewModel) {
    const requiredSuffix = viewModel.required ? ' <sup>*</sup>' : '';
    const errorMarkup = '<span data-form-error="' + escapeAttribute(viewModel.name) + '"></span>';

    if (viewModel.type === 'textarea') {
        return [
            '<div class="' + viewModel.wrapperClass + '">' +
                '<label for="' + escapeAttribute(viewModel.id) + '">' + escapeHtml(viewModel.label) + requiredSuffix + '</label>',
                '<textarea ',
                    'id="' + escapeAttribute(viewModel.id) + '" ',
                    'name="' + escapeAttribute(viewModel.name) + '" ',
                    'placeholder="' + escapeAttribute(viewModel.placeholder) + '" ',
                    'rows="' + escapeAttribute(viewModel.rows) + '"></textarea>',
                errorMarkup,
            '</div>',
        ].join('');
    }

    if (viewModel.type === 'radio') {
        return [
            '<div class="' + viewModel.wrapperClass + '">',
                '<label>' + escapeHtml(viewModel.label) + requiredSuffix + '</label>',
                viewModel.options.map(function(option) {
                    return [
                        '<div class="form-check">',
                            '<input ',
                                'type="radio" ',
                                'id="' + escapeAttribute(option.id) + '" ',
                                'name="' + escapeAttribute(viewModel.name) + '" ',
                                'value="' + escapeAttribute(option.value) + '" ',
                            '>',
                            '<label for="' + escapeAttribute(option.id) + '">' + escapeHtml(option.label) + '</label>',
                        '</div>',
                    ].join('');
                }).join(''),
                errorMarkup,
            '</div>',
        ].join('');
    }

    if (viewModel.type === 'select') {
        const selectedOption = viewModel.options.find(function(option) {
            return option.selected;
        }) || viewModel.options[0] || { value: '', label: '' };
        const placeholder = viewModel.options[0] ? viewModel.options[0].label : viewModel.label;

        return [
            '<div class="' + viewModel.wrapperClass + ' custom-select-field" data-custom-select data-custom-select-placeholder="' +
                escapeAttribute(placeholder) + '">',
                '<label for="' + escapeAttribute(viewModel.id) + '">' + escapeHtml(viewModel.label) + requiredSuffix + '</label>',
                '<div class="custom-select js-custom-select">',
                    '<select id="' + escapeAttribute(viewModel.id) + '" name="' + escapeAttribute(viewModel.name) +
                        '" class="custom-select__native js-custom-select__native" data-custom-select-native>',
                        viewModel.options.map(function(option) {
                            const selected = option.selected ? ' selected' : '';

                            return '<option value="' + escapeAttribute(option.value) + '"' + selected + '>' + escapeHtml(option.label) + '</option>';
                        }).join(''),
                    '</select>',
                    '<div class="custom-select__ui js-custom-select__ui">',
                        '<button type="button" class="custom-select__toggle js-custom-select__toggle" aria-expanded="false" ' +
                            'aria-haspopup="listbox" aria-controls="' + escapeAttribute(viewModel.id) + '-panel">',
                            '<span class="custom-select__toggle-label js-custom-select__toggle-label" data-custom-select-label>' +
                                escapeHtml(selectedOption.label || placeholder) + '</span>',
                            '<span class="custom-select__toggle-indicator">' + icon('chevron-down') + '</span>',
                        '</button>',
                        '<div id="' + escapeAttribute(viewModel.id) + '-panel" class="custom-select__panel js-custom-select__panel" role="listbox" hidden>',
                            '<div class="custom-select__options">',
                                viewModel.options.map(function(option) {
                                    const isSelected = option.selected ? ' is-selected' : '';

                                    return [
                                        '<button type="button" class="custom-select__option js-custom-select__option' + isSelected +
                                            '" data-custom-select-option data-option-value="' + escapeAttribute(option.value) +
                                            '" aria-selected="' + String(option.selected) + '" title="' + escapeAttribute(option.label) + '">',
                                            escapeHtml(option.label),
                                        '</button>',
                                    ].join('');
                                }).join(''),
                            '</div>',
                        '</div>',
                    '</div>',
                '</div>',
                errorMarkup,
            '</div>',
        ].join('');
    }

    if (viewModel.type === 'checkbox') {
        return [
            '<div class="' + viewModel.wrapperClass + '">',
                '<div class="form-check">',
                    '<input ',
                        'type="checkbox" ',
                        'id="' + escapeAttribute(viewModel.id) + '" ',
                        'name="' + escapeAttribute(viewModel.name) + '" ',
                        'value="' + escapeAttribute(viewModel.value || '1') + '" ',
                    '>',
                    '<label for="' + escapeAttribute(viewModel.id) + '">' + escapeHtml(viewModel.label) + '</label>',
                '</div>',
                errorMarkup,
            '</div>',
        ].join('');
    }

    const attributes = [
        'type="' + escapeAttribute(viewModel.type) + '"',
        'id="' + escapeAttribute(viewModel.id) + '"',
        'name="' + escapeAttribute(viewModel.name) + '"'
    ];

    if (viewModel.placeholder) {
        attributes.push('placeholder="' + escapeAttribute(viewModel.placeholder) + '"');
    }

    return [
        '<div class="' + viewModel.wrapperClass + '">',
            '<label for="' + escapeAttribute(viewModel.id) + '">' + escapeHtml(viewModel.label) + requiredSuffix + '</label>',
            '<input ' + attributes.join(' ') + '>',
            errorMarkup,
        '</div>',
    ].join('');
}

function renderContactHoneypotField() {
    return [
        '<div class="form-group form-group--honeypot" aria-hidden="true">',
            '<input ',
                'type="text" ',
                'id="honeypot" ',
                'name="honeypot" ',
                'autocomplete="off" ',
                'tabindex="-1"',
            '>',
        '</div>',
    ].join('');
}

function renderContactFields(fields) {
    const markup = [];

    for (let index = 0; index < fields.length; index += 1) {
        const field = fields[index];

        if (field.row) {
            const nextField = fields[index + 1];

            if (nextField && nextField.row) {
                markup.push([
                    '<div class="form-row">',
                        renderField(field),
                        renderField(nextField),
                    '</div>',
                ].join(''));
                index += 1;
                continue;
            }
        }

        markup.push(renderField(field));
    }

    return markup.join('');
}

function renderContact(viewModel) {
    return [
        '<section id="' + escapeAttribute(viewModel.id) + '" class="contact">',
            '<div class="container">',
                '<p class="preheader">' + escapeHtml(viewModel.preheader) + '</p>',
                '<h2>' + escapeHtml(viewModel.title) + '</h2>',
                '<div class="contact__wrapper">',
                    [
                        '<div class="card card--contact-item">',
                            '<div class="card__header">',
                                '<div class="card__icon">' + icon('coffee') + '</div>',
                                '<h3>' + escapeHtml(viewModel.introCard.title) + '</h3>',
                            '</div>',
                            '<div class="card__body">',
                                '<div class="card__body-wrapper">',
                                    '<p>' + escapeHtml(viewModel.introCard.text) + '</p>',
                                    '<a href="./contact-mailto.php"><span>' + icon('mail') + '</span><b>' + escapeHtml(viewModel.introCard.linkLabel) + '</b></a>',
                                '</div>',
                            '</div>',
                        '</div>',
                    ].join(''),
                    '<div class="card card--contact-item">',
                        '<div class="card__body">',
                            '<div class="card__body-wrapper">',
                                '<div class="contact-form__status" data-form-status aria-live="polite"></div>',
                                '<form method="post" action="' + escapeAttribute(viewModel.form.action) + '" id="contact-form" class="contact-form" novalidate>',
                                    renderContactHoneypotField(),
                                    renderContactFields(viewModel.form.fields),
                                '</form>',
                            '</div>',
                        '</div>',
                        '<div class="card__footer">',
                            renderButtonElement(viewModel.form.submitButton, [
                                'type="submit"',
                                'form="contact-form"',
                                'data-contact-submit',
                            ]),
                        '</div>',
                    '</div>',
                '</div>',
            '</div>',
        '</section>'
    ].join('');
}

function renderFooter(viewModel, siteConfig) {
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

function renderApp(data) {
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

function setMetaContent(selector, value) {
    const element = document.querySelector(selector);

    if (element) {
        element.setAttribute('content', value);
    }
}

function applyMeta(data) {
    const meta = normalizeMetaData(data);

    document.title = meta.title;

    setMetaContent('meta[name="description"]', meta.description);
    setMetaContent('meta[name="keywords"]', meta.keywords);
    setMetaContent('meta[property="og:title"]', meta.ogTitle);
    setMetaContent('meta[property="og:description"]', meta.ogDescription);
    setMetaContent('meta[property="og:image"]', meta.ogImage);
    setMetaContent('meta[property="og:site_name"]', meta.ogSiteName);

    const fluidIcon = document.querySelector('link[rel="fluid-icon"]');
    if (fluidIcon) {
        fluidIcon.setAttribute('title', meta.fluidIconTitle);
    }
}

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

function educationCarouselInitialize() {
    const itemCount = document.querySelectorAll('#education-carousel .splide__slide').length;

    if (itemCount <= 0) {
        return;
    }

    new Splide('#education-carousel', {
        type: 'loop',
        perPage: 1,
        perMove: 1,
        gap: '4rem',
        destroy: 1 >= itemCount,
        mediaQuery: 'min',
        breakpoints: {
            768: {
                perPage: 2,
                perMove: 2,
                destroy: 2 >= itemCount
            },
            1200: {
                perPage: 4,
                perMove: 4,
                destroy: 4 >= itemCount
            }
        }
    }).mount();
}

function contactFormInitialize() {
    const form = document.querySelector('#contact-form');

    if (!form) {
        return;
    }

    const submitButton = document.querySelector('[data-contact-submit]');
    const statusElement = document.querySelector('[data-form-status]');
    const defaultSubmitHtml = submitButton ? submitButton.innerHTML : '';

    function setStatus(message, type) {
        if (!statusElement) {
            return;
        }

        statusElement.textContent = message;
        statusElement.dataset.formStatus = type;
    }

    function renderErrors(errors) {
        if (!isPlainObject(errors)) {
            return;
        }

        Object.keys(errors).forEach(function(name) {
            const errorElement = form.querySelector('[data-form-error="' + name + '"]');
            const field = form.querySelector('[name="' + name + '"]');
            const message = typeof errors[name] === 'string' ? errors[name] : '';

            if (errorElement) {
                errorElement.textContent = message;
            }

            if (field) {
                field.setAttribute('aria-invalid', 'true');
            }
        });
    }

    function setSubmitting(isSubmitting) {
        form.setAttribute('aria-busy', String(isSubmitting));

        if (!submitButton) {
            return;
        }

        submitButton.disabled = isSubmitting;
        submitButton.innerHTML = isSubmitting ? 'Nachricht wird gesendet...' : defaultSubmitHtml;
    }

    function parseResponse(response) {
        return response.text().then(function(body) {
            const contentType = (response.headers.get('content-type') || '').toLowerCase();
            let payload = null;

            if (body !== '' && contentType.includes('application/json')) {
                try {
                    payload = JSON.parse(body);
                } catch (error) {
                    return {
                        ok: response.ok,
                        payload: null,
                        errorType: 'invalid-json',
                    };
                }
            }

            return {
                ok: response.ok,
                payload: isPlainObject(payload) ? payload : null,
                errorType: payload === null ? 'non-json' : '',
            };
        });
    }

    form.addEventListener('submit', function(event) {
        event.preventDefault();

        form.querySelectorAll('[data-form-error]').forEach(function(errorElement) {
            errorElement.textContent = '';
        });
        form.querySelectorAll('[aria-invalid="true"]').forEach(function(field) {
            field.removeAttribute('aria-invalid');
        });

        setStatus('', '');
        setSubmitting(true);

        fetch(form.action, {
            method: 'POST',
            body: new FormData(form),
            headers: {
                Accept: 'application/json'
            }
        }).then(function(response) {
            return parseResponse(response);
        }).then(function(result) {
            if (result.errorType === 'invalid-json') {
                setStatus('Der Server hat eine ungültige Antwort gesendet. Bitte versuche es später erneut.', 'error');
                return;
            }

            if (result.payload === null) {
                setStatus(
                    result.ok
                        ? 'Der Server hat keine verwertbare Antwort gesendet. Bitte versuche es erneut.'
                        : 'Der Server hat einen Fehler zurückgegeben. Bitte versuche es später erneut.',
                    'error'
                );
                return;
            }

            if (!result.ok || !result.payload.ok) {
                if (result.payload.errors) {
                    renderErrors(result.payload.errors);
                }

                setStatus(result.payload.message || 'Die Nachricht konnte nicht gesendet werden.', 'error');
                return;
            }

            form.reset();
            setStatus(result.payload.message, 'success');
        }).catch(function() {
            setStatus('Die Verbindung ist fehlgeschlagen. Bitte versuche es erneut.', 'error');
        }).finally(function() {
            setSubmitting(false);
        });
    });
}

document.addEventListener('DOMContentLoaded', async function() {
    try {
        await loadIcons();
        await bootstrapContent();
    } catch (error) {
        console.error(error);
        const root = document.querySelector('[data-site-root]');

        if (root) {
            root.innerHTML = '<p>Die Portfoliodaten konnten nicht geladen werden.</p>';
        }
        return;
    }

    themeInitialize();
    headerScrollInitialize();
    mobileNavigationInitialize();
    initializeCustomSelects();
    educationCarouselInitialize();
    contactFormInitialize();
});
