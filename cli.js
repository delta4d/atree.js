#!/usr/bin/env node

"use strict";

const fs = require("fs");
const path = require("path");

const help = function() {
	console.log("Usage: atree DIR");
	console.log("\t-E [pattern]\tignore file matching patterns");
}

const walk = function(file, exclude) {
	const V_BAR   = "│   ";
	const CORNER1 = "└── ";
	const CORNER2 = "├── ";

	const _prefix = function(file, depth, isLast) {
		const filename = path.basename(file);
		if (depth === 0) return filename;
		return V_BAR.repeat(depth - 1) + (isLast ? CORNER1 : CORNER2) + filename;
	}

	const _walk = function(file, depth, isLast) {
		console.log(_prefix(file, depth, isLast));

		const stat = fs.lstatSync(file);
		if (!stat.isDirectory()) return;

		const files = fs.readdirSync(file)
		                .filter(name => !exclude.some(pattern => name.match(pattern)))
		                .sort();
		const len = files.length;
		for (let i=0; i<len; ++i) {
			_walk(path.join(file, files[i]), depth+1, i+1===len);
		}
	};

	return _walk(file, 0, true);
}

const argv = process.argv.slice(2);

if (argv.length > 0) {
	const file = argv[0];
	const stat = fs.lstatSync(file);
	if (stat.isDirectory()) {
		let exclude = [];
		if (argv.length > 1 && argv[1] == "-E") {
			exclude = argv.slice(2);
		}
		walk(file, exclude);
	} else {
		console.log(`${file} is not a valid directory!`);
	}
} else {
	help();
}