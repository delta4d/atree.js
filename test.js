#!/usr/bin/env node

"use strict";

const spawn = require("child_process").spawnSync;
const assert = require("assert");

const actual = spawn("node", ["cli.js", ".", "-E", ".git", "node_modules"]).stdout.toString();

const expect = `.
├── .travis.yml
├── LICENSE
├── README.rst
├── TODO
├── cli.js
├── package.json
└── test.js
`;

assert.equal(expect, actual, `Expect ${expect}\n but found ${actual}`);
