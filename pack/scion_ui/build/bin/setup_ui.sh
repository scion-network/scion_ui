#!/bin/bash

source ~/.bashrc
source $HOME/.nenv/scion/bin/activate
source /usr/local/rvm/scripts/rvm

cd /root/code

git clone https://github.com/scion-network/scion_ui
cd scion_ui

npm install
bower install --allow-root
bower update --allow-root

grunt build

chmod -R +x dist
