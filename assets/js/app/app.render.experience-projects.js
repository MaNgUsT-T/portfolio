// Renders the timeline and project gallery from already normalized view models.
function renderExperience(viewModel) {
    return [
        '<section id="' + escapeAttribute(viewModel.id) + '" class="experience">',
            '<div class="container">',
                '<p class="preheader">' + escapeHtml(viewModel.preheader) + '</p>',
                '<h2>' + escapeHtml(viewModel.title) + '</h2>',
                '<div class="experience__wrapper">',
                    viewModel.items.map(function(item, index) {
                        // The first item keeps the highlighted body class from
                        // the legacy design; later entries render as cards.
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
                        // Each project card is fully assembled here so image,
                        // metadata, CTA and tech tags stay in one predictable
                        // markup block for styling.
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
