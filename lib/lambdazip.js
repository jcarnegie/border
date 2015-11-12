import Promise from "bluebird";
import readdir from "recursive-readdir";
import AdmZip from "adm-zip";

export default (endpointDir) => {
    return new Promise((resolve) => {
        readdir(`${endpointDir}/node_modules`, (err, files) => {
            let zip = new AdmZip();

            zip.addLocalFile(`${endpointDir}/index.js`);
            zip.addLocalFile(`${endpointDir}/package.json`);

            for (let f of files) {
                zip.addLocalFile(f);
            }
            resolve(zip.writeZip());
        });
    });
};
