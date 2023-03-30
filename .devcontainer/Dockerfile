FROM wordpress:apache@sha256:6991d7aea34c9746ab76ab22bcccdedc3594d37a148e08161c29b128bd50294c

RUN install -d -o www-data -g www-data /var/www
RUN usermod -s /bin/bash www-data

RUN apt-get -qq update && apt-get -y install git gpg mariadb-client wget && rm -rf /var/lib/apt/lists/*

RUN \
    curl -fsSL https://deb.nodesource.com/setup_lts.x | bash - && \
    apt-get -y install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

RUN \
    set -e; \
    wget -q https://getcomposer.org/installer -O composer-setup.php; \
    HASH="$(wget -q -O - https://composer.github.io/installer.sig)"; \
    php -r "if (hash_file('sha384', 'composer-setup.php') === '$HASH') { echo 'Installer verified', PHP_EOL; } else { echo 'Installer corrupt', PHP_EOL; unlink('composer-setup.php'); exit(1); }"; \
    php composer-setup.php --install-dir="/usr/local/bin" --filename=composer; \
    rm -f composer-setup.php

RUN \
    install -d -m 0755 -o root -g root /etc/wp-cli && \
    echo "path: /usr/src/wordpress" > /etc/wp-cli/wp-cli.yaml

RUN \
    curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar && \
    install -m 0755 wp-cli.phar /usr/local/bin/wp

ENV WP_CLI_CONFIG_PATH /etc/wp-cli/wp-cli.yaml

WORKDIR /usr/src/wordpress

RUN find /etc/apache2 -name '*.conf' -type f -exec sed -ri -e "s!/var/www/html!$PWD!g" -e "s!Directory /var/www/!Directory $PWD!g" '{}' +

COPY wp-config.php /usr/src/wordpress/
