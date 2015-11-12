import Promise from "bluebird";
import path from "path";
import glob from "glob";
import copy from "recursive-copy";
import transformFile from "../notranspile/transformfile";
import fs from "fs";
import r from "ramda";

let writeFile = (file, contents) => {
    return new Promise((resolve, reject) => {
        fs.writeFile(file, contents, (err) => {
            if (err) return reject(err);
            resolve();
        });
    });
};

export default async (env, stage, src, dest) => {
    return new Promise((resolve, reject) => {
        glob(`${src}/**`, async (err, files) => {
            for (let f of files) {
                if (f.match(/\.js$/)) {
                    let result = await transformFile(`${src}/${f}`);
                    let parts = r.init(f.split("/"));
                    let dir = path.dirname(f);
                    let name = `${dir}/${env}-${stage}-${parts.join("-")}`;
                    await writeFile(`${dest}/${name}.js`, result.code);
                } else {
                    await copy(`${src}/${f}`, `${dest}/${f}`);
                }
            }
            resolve();
        });
    });
};
