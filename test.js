#!/usr/bin/env node

"use strict";

const spawn  = require("child_process").spawnSync;
const assert = require("assert");

const test_01 = function() {
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
}

const test_02 = function() {
	spawn("mkdir", ["-p", "a/b/c"]);

	const actual = spawn("node", ["cli.js", "a"]).stdout.toString();

	const expect = `a
└── b
    └── c
`;

	spawn("rm", ["-rf", "a"]);

	assert.equal(expect, actual, `Expect ${expect}\n but found ${actual}`);
}

const tests  = [test_01, test_02];

tests.forEach(fn => fn());