#!/bin/sh

/usr/local/bin/setup-wordpress.sh

if [ -n "${RepositoryName}" ]; then
    dir=/workspaces/${RepositoryName}
else
    dir=$(pwd)
fi

sudo rm -rf "/wp/wp-content/plugins/wp-identigraf"
sudo ln -sf "${dir}" "/wp/wp-content/plugins/wp-identigraf"
wp plugin activate wp-identigraf
