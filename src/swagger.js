import Promise from "bluebird";
import globber from "glob";
import path from "path";
import fs from "fs";
import r from "ramda";

let glob          = Promise.promisify(globber);
let readFile      = Promise.promisify(fs.readFile);
let readAndParse  = r.composeP(JSON.parse, readFile);
let resourceOnly  = filepath => {
    return filepath.replace("/package.json").replace(/\/[^\/]+$/, "");
};
let notModule = filename => !filename.match(/node_modules/);

let pathAndSpec  = r.curry(async (prefix, file) => {
    try {
        let pathSpec = await readAndParse(file, "utf8");
        let method   = path.basename(file.replace("/package.json", ""));
        let uri      = resourceOnly(file).replace(prefix, "");
        let spec     = {};
        spec[method] = pathSpec["x-swagger-path"];
        return r.assoc(uri, spec, {});
    } catch (e) {
        console.error(`Error parsing swagger config: ${file}`);
        console.error(e.stack);
        throw e;
    }
});

let addPathToSwagger = (swagger, pathSpecPair) => {
    swagger.paths = { ...swagger.paths, ...pathSpecPair };
    return swagger;
};

let build = async stage => {
    let swagger = await readAndParse("swagger.json", "utf8");
    let files   = await glob(`src/${stage}/**/package.json`);
    let data    = await * r.map(pathAndSpec(`src/${stage}`), r.filter(notModule, files));
    if (!swagger.paths) swagger.paths = {};
    let spec = r.reduce(addPathToSwagger, swagger, data);
    return spec;
};

export default { build };
