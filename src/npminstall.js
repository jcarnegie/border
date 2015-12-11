import { exec } from "child_process";
import Promise from "bluebird";

let install = () => {
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

    data = await install(dir);

    process.chdir(cwd);

    return data;
};
