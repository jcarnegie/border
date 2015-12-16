import Promise from "bluebird";
import shell from "shelljs";

export default async (command) => {
    return new Promise((resolve) => {
        let silent = true;
        let async = true;
        let options = { silent, async };
        shell.exec(command, options, (code, output) => {
            resolve(code, output);
        });
    });
};
