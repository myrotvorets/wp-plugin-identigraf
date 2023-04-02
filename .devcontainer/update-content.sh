#!/bin/sh

DIR=$(dirname "$(readlink -enq "$0")")

if [ -f "${DIR}/.env" ]; then
    sudo cp "${DIR}/.env" /etc/conf.d/php-fpm.env
    sudo sv restart php-fpm
fi

composer install
npm install
npm run build
