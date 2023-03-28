#!/bin/sh

DB_USER=wordpress
DB_NAME=wordpress
DB_PASS=wordpress
DB_HOST=db
DB_ROOT_PASS=wordpress

# See https://docs.github.com/en/codespaces/developing-in-codespaces/default-environment-variables-for-your-codespace
if [ -n "${CODESPACE_NAME}" ] && [ -n "${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}" ]; then
    WP_DOMAIN="${CODESPACE_NAME}-80.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}"
else
    WP_DOMAIN=localhost
fi

echo "Waiting for MySQL to come online..."
second=0
while ! mysqladmin ping -uroot -p"${DB_ROOT_PASS}" -h"${DB_HOST}" --silent && [ "${second}" -lt 60 ]; do
    sleep 1
    second=$((second+1))
done
if ! mysqladmin ping -uroot -p"${DB_ROOT_PASS}" -h"${DB_HOST}" --silent; then
    echo "ERROR: mysql has failed to come online"
    exit 1;
fi

if ! wp core is-installed 2> /dev/null; then
    wp core install --url="http://${WP_DOMAIN}" --title="Development site" --admin_user=admin --admin_password=pass --admin_email=admin@localhost.localdomain --skip-email --locale=uk_UA
    wp option set blog_public 0
fi

wp plugin activate wp-identigraf
