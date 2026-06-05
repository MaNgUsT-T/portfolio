ARG PHP_VERSION
FROM php:${PHP_VERSION}-fpm
ARG WP_CLI_VERSION
ARG HOST_UID
ARG HOST_GID
ARG IMAGE_BUILD_SIGNATURE=unknown

WORKDIR /var/www/html
LABEL dev.wp.image-build-signature="${IMAGE_BUILD_SIGNATURE}"

RUN set -eux; \
    sed -ri 's/^pm\.max_children\s*=.*/pm.max_children = 10/' /usr/local/etc/php-fpm.d/www.conf; \
    sed -ri 's/^pm\.start_servers\s*=.*/pm.start_servers = 4/' /usr/local/etc/php-fpm.d/www.conf; \
    sed -ri 's/^pm\.min_spare_servers\s*=.*/pm.min_spare_servers = 2/' /usr/local/etc/php-fpm.d/www.conf; \
    sed -ri 's/^pm\.max_spare_servers\s*=.*/pm.max_spare_servers = 6/' /usr/local/etc/php-fpm.d/www.conf; \
    sed -ri 's/^;?pm\.max_requests\s*=.*/pm.max_requests = 500/' /usr/local/etc/php-fpm.d/www.conf

# Align www-data with host UID/GID so bind mounts stay writable on Linux/WSL.
RUN set -eux; \
    : "${HOST_UID:?HOST_UID is required}"; \
    : "${HOST_GID:?HOST_GID is required}"; \
    if [ "$(id -g www-data)" != "${HOST_GID}" ]; then \
      groupmod --non-unique --gid "${HOST_GID}" www-data; \
    fi; \
    if [ "$(id -u www-data)" != "${HOST_UID}" ]; then \
      usermod --non-unique --uid "${HOST_UID}" --gid "${HOST_GID}" www-data; \
    else \
      usermod --gid "${HOST_GID}" www-data; \
    fi; \
    mkdir -p /var/www/.wp-cli; \
    chown -R "${HOST_UID}:${HOST_GID}" /var/www/.wp-cli

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    gnupg \
    libfreetype-dev \
    libjpeg62-turbo-dev \
    libpng-dev \
    libwebp-dev \
    libxpm-dev \
    libzip-dev \
    zlib1g-dev \
    libicu-dev \
    libonig-dev \
    default-mysql-client \
    && rm -rf /var/lib/apt/lists/*

# Trust local MITM/Proxy CA (Sophos)
COPY ./certs/sophos.pem /usr/local/share/ca-certificates/sophos.crt
RUN update-ca-certificates

RUN docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp --with-xpm \
    && docker-php-ext-install gd

# imap wird lokal nicht benötigt; bei Bedarf per PECL/angepasstem Image nachrüsten

RUN docker-php-ext-install \
    bcmath \
    exif \
    intl \
    mbstring \
    mysqli \
    pdo_mysql \
    zip

# WP-CLI installieren (GPG-verifiziert, Version gepinnt)
RUN set -eux; \
    : "${WP_CLI_VERSION:?WP_CLI_VERSION is required}"; \
    curl -fSL -o /tmp/wp-cli.phar https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar; \
    curl -fSL -o /tmp/wp-cli.phar.asc https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar.asc; \
    curl -fSL -o /tmp/wp-cli.pgp https://raw.githubusercontent.com/wp-cli/builds/gh-pages/wp-cli.pgp; \
    gpg --batch --import /tmp/wp-cli.pgp; \
    gpg --batch --verify /tmp/wp-cli.phar.asc /tmp/wp-cli.phar; \
    php /tmp/wp-cli.phar --info | grep -E "^WP-CLI version:[[:space:]]*${WP_CLI_VERSION}$"; \
    chmod +x /tmp/wp-cli.phar; \
    mv /tmp/wp-cli.phar /usr/local/bin/wp; \
    rm -f /tmp/wp-cli.phar.asc /tmp/wp-cli.pgp; \
    rm -rf /root/.gnupg
