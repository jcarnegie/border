import { exec } from "child_process";
import Promise from "bluebird";
import npm from "npm";

let install = (dir) => {
    return new Promise((resolve, reject) => {
        let child = exec("npm install");
        child.on("error", (code) => {
            reject(code, child.stdout, child.stderr);
        });
        child.on("exit", (code) => {
            if (code === 0) return resolve(child.stdout, child.stderr);
            reject(code, child.stdout, child.stderr);
        });
    });
};

export default async (dir) => {
    let cwd = process.cwd();
    let data = null;

    process.chdir(dir);

    // await load(dir);
    data = await install(dir);

    process.chdir(cwd);

    return data;
};
