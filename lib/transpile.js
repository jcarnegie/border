import Promise from "bluebird";
import glob from "glob";
import copy from "recursive-copy";
import transformFile from "../notranspile/transformfile";
import fs from "fs";

let writeFile = (file, contents) => {
    return new Promise((resolve, reject) => {
        fs.writeFile(file, contents, (err) => {
            if (err) return reject(err);
            resolve();
        });
    });
};

export default async (src, dest) => {
    return new Promise((resolve, reject) => {
        glob(`${src}/**`, async (err, files) => {
            for (let f of files) {
                if (f.match(/\.js$/)) {
                    let result = await transformFile(`${src}/${f}`);
                    await writeFile(`${dest}/${f}`, result.code);
                } else {
                    await copy(`${src}/${f}`, `${dest}/${f}`);
                }
            }
            resolve();
        });
    });
};
