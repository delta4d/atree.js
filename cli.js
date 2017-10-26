#!/usr/bin/env node

"use strict";

const fs = require("fs");
const path = require("path");
const arg_parser = require("minimist");
const color_info = require("ls-colors");
const FStatMode = require("fstat-mode");

const help = () => {
    console.log("Usage: atree [options] [directory=.]");
    console.log();
    console.log("    -a                show hidden files");
    console.log("    --help            show this message");
    console.log("    --color           color output");
    console.log("                      auto/always/never. default to auto");
}

const walk = (file, opts) => {
    const V_BAR   = "│   ";
    const EMPTY   = "    ";
    const CORNER1 = "└── ";
    const CORNER2 = "├── ";
    const NEED_COLOR = opts.color === "always" ||
                       opts.color === "auto" && process.stdout.isTTY;

    var dir_cnt   = -1; // exclude current directory
    var file_cnt  = 0;

    const _colorize = (filename, mode) => {
        if (!NEED_COLOR) return filename;
        const wrap = (c) => `\u001b[${c}m${filename}\u001b[0m`;
        if (mode.is_socket)     return wrap(color_info['so']);
        if (mode.is_symbolic)   return wrap(color_info['ln']);
        if (mode.is_fifo)       return wrap(color_info['fi']);
        if (mode.is_block)      return wrap(color_info['bd']);
        if (mode.is_character)  return wrap(color_info['cd']);
        if (mode.is_directory)  return wrap(color_info['di']);
        if (mode.owner.execute) return wrap(color_info['ex']);
        if (!mode.is_regular)   return filename;
        const ext_pattern = '*' + path.extname(filename);
        return color_info[ext_pattern] ? wrap(color_info[ext_pattern]) : filename;
    }

    const _prefix = (file, is_last, prev) => {
        const mode = new FStatMode(fs.lstatSync(file));
        const raw_filename = path.basename(file);
        const filename = _colorize(raw_filename, mode);
        if (prev.length === 0) return filename;
        return prev.slice(1)
                   .map(last => last ? EMPTY : V_BAR)
                   .join("") + (is_last ? CORNER1 : CORNER2) + filename;
    }

    const _filter = (dir) => {
        let files = fs.readdirSync(dir);

        if (!opts.a) {
            files = files.filter(name => name.match(/^[^.].*$/));
        }

        return files;
    }

    const _walk = (file, is_last, prev) => {
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

    fs.lstat(file, (err, stat) => {
        if (err || !stat.isDirectory()) {
            console.log(`${file} [error opening dir]`);
        } else {
            _walk(file, true, []);
        }
        console.log();
        if (dir_cnt < 0) dir_cnt = 0;
        console.log(`${dir_cnt} director${dir_cnt == 1 ? "y" : "ies"}, ${file_cnt} files`);
    });
}

var unknown = [];
const argv = process.argv.slice(2);
const opts = arg_parser(argv, {
    boolean: ["a", "help"],
    string: ["color"],
    default: {
        a: false,
        help: false,
        color: "auto"
    },
    unknown: (arg) => {
        unknown.push(arg);
        return false;
    }
});

const valid_opts = {
    a: [false, true],
    help: [false, true],
    color: ["auto", "always", "never"],
};

const check_opts = (opts, valid_opts) => {
    for (let k in valid_opts) {
        if (!valid_opts[k].includes(opts[k])) {
            console.log(`Invalid argument for ${k}: ${opts[k]}`);
            console.log(`Valid arguments are ${valid_opts[k].join(', ')}`);
            console.log();
            help();
            return false;
        }
    }
    for (let k in unknown) if (k[0] == '-') {
        console.log(`Unknow options: ${k}`);
        console.log();
        help();
        return false;
    }
    return true;
}

if (!check_opts(opts, valid_opts)) process.exit();

if (opts.help) {
    help();
} else {
    const file = unknown.length == 0 ? "." : unknown[0];
    walk(file, opts);
}
