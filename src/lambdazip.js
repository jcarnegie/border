import Promise from "bluebird";
import readdir from "recursive-readdir";
import AdmZip from "adm-zip";

export default (endpointDir, functionName = "index") => {
    return new Promise((resolve) => {
        let zip = new AdmZip();
        zip.addLocalFolder(endpointDir);
        resolve(zip.toBuffer());
    });
};
