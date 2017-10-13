#!/usr/bin/env node

"use strict";

const fs = require("fs");
const path = require("path");
const arg_parser = require("minimist");

const help = function() {
	console.log("Usage: atree [options] [directory=.]");
	console.log();
	console.log("    atree -a                show hidden files");
	console.log("    atree -P pattern        only list file match pattern");
	console.log("    atree -I pattern        do not list file match pattern");
}

const walk = function(file, opts) {
	const V_BAR   = "│   ";
	const EMPTY   = "    ";
	const CORNER1 = "└── ";
	const CORNER2 = "├── ";
	var dir_cnt   = -1; // exclude current directory
	var file_cnt  = 0;

	const _prefix = function(file, is_last, prev) {
		const filename = path.basename(file);
		if (prev.length === 0) return filename;
		return prev.slice(1)
		           .map(last => last ? EMPTY : V_BAR)
		           .join("") + (is_last ? CORNER1 : CORNER2) + filename;
	}

	const _filter = function(dir) {
		let files = fs.readdirSync(dir);

		if (!opts.a) {
			files = files.filter(name => name.match(/^[^.].*$/));
		}

		if (opts.P) {
			files = files.filter(name => name.match(opts.P));
		}

		if (opts.I) {
			files = files.filter(name => !name.match(opts.I));
		}

		return files;
	}

	const _walk = function(file, is_last, prev) {
		console.log(_prefix(file, is_last, prev));

		const stat = fs.lstatSync(file);
		if (!stat.isDirectory()) {
			++file_cnt;
			return;
		}
		++dir_cnt;

		const files = _filter(file);
		const len = files.length;
		prev.push(is_last);
		for (let i=0; i<len; ++i) {
			const next_path = path.join(file, files[i]);
			const next_is_last = i + 1 === len;
			_walk(next_path, next_is_last, prev);
		}
		prev.pop();
	};

	_walk(file, true, []);
	console.log();
	console.log(`${dir_cnt} director${dir_cnt == 1 ? "y" : "ies"}, ${file_cnt} files`);
}

const argv = process.argv.slice(2);
const opts = arg_parser(argv, {
	boolean: ["a", "help"],
	default: {
		a: false,
		help: false,
	}
});

if (opts.help) {
	help();
} else {
	const file = opts._.length == 0 ? "." : opts._[0];
	walk(file, opts);
}
