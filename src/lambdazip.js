import pathUtil from "path";
import Promise from "bluebird";
import exec from "./exec";
import fs from "fs";

let readFile = Promise.promisify(fs.readFile);

export default async (endpointDir) => {
    let zipFile = "endpoint.zip";
    let zipPath = pathUtil.join(endpointDir, zipFile);

    let cmd = [
        `cd '${endpointDir}'`,
        `zip -9r ${zipFile} *`
    ].join(" && ");

    let code = await exec(cmd);

    if (code !== 0) {
        let msg = `exit code '${code}' for ${cmd}`;
        throw new Error(msg);
    }

    return await readFile(zipPath);
};
