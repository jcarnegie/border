import Promise from "bluebird";
import mkdirp from "mkdirp";
import path from "path";
import glob from "glob";
import copy from "recursive-copy";
import fs from "fs";

let transformFile = require("./transformfile");

let writeFileSafe = (file, contents) => {
    return new Promise((resolve, reject) => {
        let dir = path.dirname(file);
        mkdirp(dir, () => {
            fs.writeFile(file, contents, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });
    });
};

export default async (src, dest, nameTransformFn) => {
    return new Promise((resolve) => {
        glob(`${src}/**`, { nodir: true, follow: true }, async (err, files) => {
            console.log("transpiling files:", files);
            for (let prefixedFile of files) {
                let file = prefixedFile.replace(`${src}/`, "");
                if (file.match(/\.js$/)) {
                    let result = await transformFile(prefixedFile);
                    let filename = nameTransformFn(`${dest}/${file}`);
                    await writeFileSafe(filename, result.code);
                } else {
                    await copy(`${src}/${file}`, `${dest}/${file}`, { overwrite: true });
                }
            }
            resolve();
        });
    });
};
