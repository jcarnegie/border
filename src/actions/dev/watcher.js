#!/usr/bin/env node

import "babel-polyfill";
import Promise from "bluebird";
import chokidar from "chokidar";
import transformfile from "../../transformfile";
import { spawn } from "child_process";
import fs from "fs";
import r from "ramda";

let server = null;
let srcWatcher = null;
let writeFile = Promise.promisify(fs.writeFile);

let start = async (stage) => {
    try {
        let cwd = process.cwd();
        let node = process.argv[0];
        let path = "node_modules/border/lib/actions/dev/server.js";

        server = spawn(node, [path, stage]);
        server.stdout.on("data", data => process.stdout.write(data.toString()));
        server.stderr.on("data", data => process.stderr.write(data.toString()));

        srcWatcher  = chokidar.watch(`${cwd}/src/${stage}/**/*.js`);

        let isJsFile = (path) => {
            return r.test(/\.js$/, path);
        };

        let addSrcPath = path => {
            if (isJsFile(path)) {
                srcWatcher.add(path);
            }
        };

        let tpSrc = async src => {
            let stagePath = src.replace(new RegExp(`^${cwd}/src/`), "");
            let dest = `${cwd}/dist/${stagePath}`;
            let result = await transformfile(src);
            await writeFile(dest, result.code);
            restart(stage);
        };

        srcWatcher
            .on("add", addSrcPath)
            .on("change", tpSrc);
    } catch (e) {
        console.log("error:", e.stack); // eslint-disable-line
    }
};

let stop = () => {
    srcWatcher.close();
    server.kill();
};

let restart = (stage) => {
    stop();
    start(stage);
};

export default { start, stop, restart };
