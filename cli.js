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
	const EMPTY   = "    ";
	const CORNER1 = "└── ";
	const CORNER2 = "├── ";

	const _prefix = function(file, is_last, prev) {
		const filename = path.basename(file);
		if (prev.length === 0) return filename;
		return prev.slice(1)
		           .map(last => last ? EMPTY : V_BAR)
		           .join("") + (is_last ? CORNER1 : CORNER2) + filename;
	}

	const _walk = function(file, is_last, prev) {
		console.log(_prefix(file, is_last, prev));

		const stat = fs.lstatSync(file);
		if (!stat.isDirectory()) return;

		const files = fs.readdirSync(file)
		                .filter(name => !exclude.some(pattern => name.match(pattern)))
		                .sort();
		const len = files.length;
		prev.push(is_last);
		for (let i=0; i<len; ++i) {
			const next_path = path.join(file, files[i]);
			const next_is_last = i + 1 === len;
			_walk(next_path, next_is_last, prev);
		}
		prev.pop();
	};

	return _walk(file, true, []);
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