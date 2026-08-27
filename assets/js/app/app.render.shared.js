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
