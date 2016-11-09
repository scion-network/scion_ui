FROM bitnami/apache
MAINTAINER Michael Meisinger <michael.meisinger@gmail.com>

# Install Node.js, npm and ruby
RUN apt-get update && apt-get install -y --no-install-recommends \
        git git-core vim build-essential \
        python-pip python-virtualenv virtualenvwrapper \
        python2.7 python2.7-dev python python-all-dev \
        nodejs npm ruby-full wget


# install npm basic dependencies

ENV HOME=/root
ENV BIN_DIR=$HOME/bin CODE_DIR=$HOME/code SCION_DIR=$HOME/code/scion_ui

ADD build/bin/setup_deps.sh $HOME/bin/setup_deps.sh
RUN chmod -R +x $HOME/bin
RUN bash $HOME/bin/setup_deps.sh

ADD build/bin/setup_ui.sh $HOME/bin/setup_ui.sh
RUN chmod -R +x $HOME/bin
RUN bash $HOME/bin/setup_ui.sh

ADD build/apache/.htpasswd /bitnami/apache/conf/.htpasswd
ADD build/apache/scion.conf /bitnami/apache/conf/vhosts/scion.conf
