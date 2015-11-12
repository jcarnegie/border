import Promise from "bluebird";
import npm from "npm";

let load = (dir) => {
    return new Promise((resolve, reject) => {
        npm.load(`${dir}/package.json`, (err) => {
            resolve();
        });
    });
};

let install = () => {
    return new Promise((resolve, reject) => {
        npm.commands.install([], (err, data) => {
            resolve(data);
        });
    });
};

export default async (dir) => {
    let cwd = process.cwd();
    let data = null;

    process.chdir(dir);

    await load(dir);
    data = await install();

    process.chdir(cwd);
    
    return data;
};
