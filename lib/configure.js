import pathUtil from "path";
import Promise from "bluebird";
import globCb from "glob";
import r from "ramda";

let awaitable = Promise.promisify;
let glob = awaitable(globCb);

export default async (app, stage) => {
    let files = await glob(`src/${stage}/**/package.json`);

    let endpointWrapper = r.curry((handler, req, res) => {
        let event = {};
        let context = {
            done: (err, data) => {
                if (err) return res.status(500).send({ error: err });
                res.send(data);
            }
        };
        console.log(handler);
        console.log(handler.toString());
        handler(event, context);
    });

    let extractEndpointData = (file) => {
        let methodPath = pathUtil.dirname(file).replace(`src/${stage}`, "");
        let pathParts  = r.split("/", methodPath);
        let method     = r.last(pathParts);
        let handler    = require(`../${pathUtil.dirname(file)}`).handler;

        return {
            methodPath,
            pathParts,
            method,
            path: r.join("/", r.init(pathParts)),
            handler: handler,
            wrapper: endpointWrapper(handler)
        };
    };

    let addEndpoint = r.curry((app, ep) => {
        app[ep.method](ep.path, ep.wrapper);
    });

    let endpointData = r.map(extractEndpointData, files);

    let wireUpEndpoints = r.compose(
        r.map(addEndpoint(app)),
        r.map(extractEndpointData)
    );

    wireUpEndpoints(files);

    return app;
};
