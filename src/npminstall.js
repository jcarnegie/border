import Promise from "bluebird";
import shell from "shelljs";

let exec = async (command) => {
    return new Promise((resolve) => {
        let silent = true;
        let async = true;
        let options = { silent, async };
        shell.exec(command, options, (code, output) => {
            resolve(code, output);
        });
    });
};

// let install = () => {
//     return new Promise((resolve, reject) => {
//         let child = exec("npm install");
//         child.on("error", (code) => {
//             reject(code, child.stdout, child.stderr);
//         });
//         child.on("exit", (code) => {
//             if (code === 0) return resolve(child.stdout, child.stderr);
//             reject(code, child.stdout, child.stderr);
//         });
//     });
// };

export default async (dir) => {
    let commands = [
        ". ~/.nvm/nvm.sh",
        // "nvm use v0.10.36",
        `cd ${dir}`,
        "npm install"
    ];
    let envCmd = process.env.BORDER_NPM_INSTALL_COMMAND;
    let cmd = (envCmd) ? envCmd.replace("%dir%", dir) : commands.join(" && ");
    let result = await exec(cmd);
    let output = result[1];
    return output;
};
