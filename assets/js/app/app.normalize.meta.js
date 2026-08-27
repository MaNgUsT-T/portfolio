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
