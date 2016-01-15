import r from "ramda";
import AWS from "aws-sdk";
import Promise from "bluebird";
import { basename } from "path";
import { reduceAsync } from "util";

let gateway = new AWS.APIGateway();
let createResource = Promise.promisify(gateway.createResource.bind(gateway));

let getExistingResources = r.map(r.pick(["id", "path"]));

let getSwaggerResources = (spec) => {
    let assoc = r.flip(r.assoc("path"));
    return r.map(assoc({}), r.keys(spec.paths));
};

let paths = r.map(r.prop("path"));

let mergeParentIdAndPath = (resource, map) =>
    r.merge(map, r.pick(["parentId", "path"], resource));

let pathParentIdMap = r.reduce(mergeParentIdAndPath, {});

let createResourcePath = r.curry(async (restApiId, pathMap, path) => {
    let parentId = r.prop(path, pathMap);
    let pathPart = basename(path);

    let result = await createResource({
        restApiId,
        parentId,
        pathPart
    });

    return r.assoc(path, result.id, pathMap);
});

export let update = async (apiId, existingApi, swaggerApi) => {
    let existingResources = getExistingResources(existingApi);
    let swaggerResources = getSwaggerResources(swaggerApi);
    let swaggerPaths = paths(swaggerResources);
    let existingPaths = paths(existingResources);
    let newResourcePaths = r.difference(swaggerPaths, existingPaths);
    let map = pathParentIdMap(existingResources);
    return await reduceAsync(createResourcePath(apiId), map, newResourcePaths);
};
