ATREE |travis|
==============

Display directory tree structure in terminal.
A very simplified ver of unix utility tree__.

.. __: mama.indstate.edu/users/ice/tree/

.. |travis| image:: https://travis-ci.org/delta4d/atree.js.svg?branch=master
    :target: https://travis-ci.org/delta4d/atree.js


Installation
------------

::

    npm install atree --global


Usage
-----

::

    atree.js $ atree
    Usage: atree DIR
        -E [pattern]    ignore file matching patterns

    atree.js $ atree . -E .git node_modules
    .
    ├── .travis.yml
    ├── LICENSE
    ├── README.rst
    ├── TODO
    ├── cli.js
    ├── package.json
    └── test.js

Tests
-----

::

    npm test


Contributing
------------

Feel free to file an issue__ or make a pr.

.. __: https://github.com/delta4d/atree.js/issues
