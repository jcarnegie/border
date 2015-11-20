import Promise from "bluebird";
import mkdirp from "mkdirp";
import path from "path";
import glob from "glob";
import copy from "recursive-copy";
import transformFile from "../notranspile/transformfile";
import fs from "fs";
import r from "ramda";

let writeFileSafe = (file, contents) => {
    return new Promise((resolve, reject) => {
        let dir = path.dirname(file);
        mkdirp(dir, (err1) => {
            fs.writeFile(file, contents, (err2) => {
                if (err2) return reject(err2);
                resolve();
            });
        });
    });
};

export default async (src, dest, nameTransformFn = r.identity) => {
    return new Promise((resolve, reject) => {
        glob(`${src}/**`, { nodir: true }, async (err, files) => {
            for (let prefixedFile of files) {
                let f = prefixedFile.replace(`${src}/`, "");
                if (f.match(/\.js$/)) {
                    let result = await transformFile(prefixedFile);
                    let filename = nameTransformFn(`${dest}/${f}`);
                    await writeFileSafe(filename, result.code);
                } else {
                    await copy(`${src}/${f}`, `${dest}/${f}`, { overwrite: true });
                }
            }
            resolve();
        });
    });
};
