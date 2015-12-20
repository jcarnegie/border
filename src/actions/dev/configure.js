/**
 * Configures a border dev webserver for local development.
 */
import pathUtil from "path";
import Promise from "bluebird";
import globCb from "glob";
import fs from "fs";
import r from "ramda";

let awaitable = Promise.promisify;
let glob = awaitable(globCb);
let readFile = async (path) => await awaitable(fs.readFile)(path, "utf8");
let writeFile = r.curry(async (path, contents) => await awaitable(fs.writeFile)(path, contents, null));
let append = r.curry((s2, s1) => s1 + s2);

let removeBabelPolyfillRequire = async (path) => {
    return await r.composeP(
        writeFile(path),
        r.replace('require("babel-polyfill");', ""),
        readFile
    )(path);
};

let ignoreNodeModules = r.compose(
    r.not,
    r.test(/node_modules/)
);

export default async (app, stage) => {
    let cwd = process.cwd();
    let allFiles = await glob(`${cwd}/dist/${stage}/**/package.json`);
    let files = r.filter(ignoreNodeModules, allFiles);

    let endpointWrapper = r.curry((handler, req, res) => {
        let event = {
            ...req.headers,
            ...req.query,
            ...req.param,
            body: req.body
        };
        let context = {
            done: (err, data) => {
                if (err) return res.status(500).send({ error: err });
                res.send(data);
            }
        };

        handler(event, context);
    });

    let extractEndpointData = (file) => {
        let cwd        = process.cwd();
        let dir        = pathUtil.dirname(file);
        let methodPath = dir
            .replace(new RegExp(`^${cwd}/`), "")
            .replace(`dist/${stage}`, "")
            .replace(/\{([^\}]+)\}/, ":$1");
        let pathParts  = r.split("/", methodPath);
        let method     = r.last(pathParts);
        let modulePath = pathUtil.dirname(file);
        let path       = r.join(`/`, r.prepend(`/${stage}`, r.tail(r.init(pathParts))));
        let module     = require(modulePath);
        let handler    = module.handler;


        return {
            methodPath,
            pathParts,
            method,
            handler,
            path,
            wrapper: endpointWrapper(handler)
        };
    };

    let addEndpoint = r.curry((app, ep) => {
        let method = ep.method.toUpperCase();
        console.log(`Adding endpoint ${method} ${ep.path}`); // eslint-disable-line
        app[ep.method](ep.path, ep.wrapper);
    });

    let wireUpEndpoints = r.compose(
        r.map(addEndpoint(app)),
        r.map(extractEndpointData)
    );

    let moduleName = r.compose(append("/index.js"), pathUtil.dirname);
    let moduleFiles = r.map(moduleName, files);
    await Promise.all(r.map(removeBabelPolyfillRequire, moduleFiles));
    wireUpEndpoints(files);

    return app;
};
