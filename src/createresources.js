import r from "ramda";
import { dirname } from "path";
import { reduceAsync } from "./util";
import apigateway from "./apigateway";

export let createResource = r.curry(async (region, apiId, awsResources, resourcePath) => {
    let parentPath = dirname(resourcePath);
    let parentResource = r.find(r.propEq("path", parentPath), awsResources);
    let parentId = parentResource.id;
    let pathPart = r.last(r.split("/", resourcePath));
    return await apigateway.createResource(region, apiId, parentId, pathPart);
});

export let createResources = r.curry(async (region, apiId, resources, resourcePaths) => {
    let reducer = async (resources, path) => {
        let resource = await createResource(
            region,
            apiId,
            resources,
            path
        );
        return r.append(resource, resources);
    };
    return reduceAsync(reducer, resources, resourcePaths);
});
