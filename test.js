#!/usr/bin/env node

"use strict";

const spawn = require("child_process").spawnSync;
const assert = require("assert");

const actual = spawn("node", ["cli.js", ".", "-E", ".git"]).stdout.toString();

const expect = `.
├── .travis.yml
├── cli.js
├── LICENSE
├── package.json
├── README.rst
└── test.js
`;

assert.equal(expect, actual, `Expect ${expect}\n but found ${actual}`);