#!/bin/bash

# Define shell environment
cat <<EOF >> ~/.bashrc
export PYTHONPATH=.
export WORKON_HOME='~/.virtualenvs'
source /usr/share/virtualenvwrapper/virtualenvwrapper.sh
workon scion
cd
EOF

# Initialize virtualenv for the first time
export WORKON_HOME='/root/.virtualenvs'
source /usr/share/virtualenvwrapper/virtualenvwrapper.sh

mkvirtualenv scion

source ~/.bashrc

# Create virtualenv
workon scion
pip install setuptools --upgrade
pip install pip --upgrade

pip install --upgrade nodeenv
nodeenv $HOME/.nenv/scion
source $HOME/.nenv/scion/bin/activate

gpg --keyserver hkp://keys.gnupg.net --recv-keys 409B6B1796C275462A1703113804BB82D39DC0E3
\curl -sSL https://get.rvm.io | bash -s stable --ruby

source /usr/local/rvm/scripts/rvm

cat <<EOF >> ~/.bashrc
source $HOME/.nenv/scion/bin/activate
source /usr/local/rvm/scripts/rvm
EOF

rvm use 2.3.0 --default
ruby --version

gem update --system

npm install -g grunt
npm install -g bower

gem install sass
gem install compass

# Get code
mkdir -p code
cd code
mkdir -p logs
