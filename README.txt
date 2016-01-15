===========================================================
SciON UI - Scientific Observatory Network UI

(C) Individual Contributors, 2015
(C) The Regents of the University of California, 2015
All rights reserved.
===========================================================


DESCRIPTION
===========

User interface for the Scientific Observatory Network (SciON).
Implemented as HTML5 SPA Web client.

Accesses the Scientific Observatory Network (SciON) services and the
ScionCC container.
  https://github.com/scion-network/scion
  https://github.com/scionrep/scioncc


LICENSE
=======

SciON / ScionUI is open source under BSD license. See file LICENSE.txt in this
directory.


INSTALLATION
============

Please follow the instructions in the file INSTALL.txt in this directory.


USAGE
=====

* Activate virtual environments

    > source $HOME/.venv/scion/bin/activate
    > source $HOME/.nenv/scion/bin/activate

* Run bower (retrieves requested packages)

    > rm -rf app/bower_components
    > bower update

* Run application for local development with local backend

    > grunt server

* Build dist directory for deployment

    > rm -rf dist
    > grunt build
