import Promise from "bluebird";
import AdmZip from "adm-zip";

export default (endpointDir) => {
    return new Promise((resolve) => {
        let zip = new AdmZip();
        zip.addLocalFolder(endpointDir);
        resolve(zip.toBuffer());
    });
};
