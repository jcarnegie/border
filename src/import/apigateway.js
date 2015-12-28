import r from "ramda";

const resourceProps = [
    "id",
    "parentId",
    "pathPart",
    "path"
];

const methodProps = [
    "apiKeyRequired",
    "authorizationType",
    "httpMethod"
];

const integrationProps = [
    "cacheKeyParameters",
    "cacheNamespace",
    "httpMethod",
    "requestTemplates",
    "type",
    "uri"
];

let importParams = (params, param) => {
    let parts = r.split(".", param);
    let type = parts[2];
    params[type] = r.append(parts[3], params[type] || []);
    return params;
};

let importIntegration = (method) => {
    let integrationPath = ["_embedded", "method:integration"];
    let integration = r.pick(integrationProps, r.path(integrationPath, method) || {});

    let intRespParts = r.concat(
        integrationPath,
        ["_embedded", "integration:responses"]
    );
    let respKeys = ["statusCode", "selectionPattern", "responseTempates"];
    let responses = r.path(intRespParts, method);
    if (!r.is(Array, responses)) responses = [responses];
    let modifiedResponse = r.map(r.pick(respKeys), responses);
    integration.responses = modifiedResponse;

    return integration;
};

let importResponses = (method) => {
    let responsesPath = ["_embedded", "method:responses"];
    let responses = r.path(responsesPath, method);
    if (!r.is(Array, responses)) responses = [responses];
    return r.map(r.pick(["statusCode"]), responses);
};

let importMethods = (methods, method) => {
    let verb = method.httpMethod;
    methods[verb] = r.pick(methodProps, method);

    let paramKeys = r.keys(method.requestParameters || []);
    let params = r.reduce(importParams, {}, paramKeys);
    methods[verb].params = params;
    methods[verb].integration = importIntegration(method);
    methods[verb].responses = importResponses(method);

    return methods;
};

let importResources = (resources, resource) => {
    let path = resource.path;
    resources[path] = r.pick(resourceProps, resource);

    let pathParts = ["_embedded", "resource:methods"];
    let methods = r.path(pathParts, resource) || [];
    if (!r.is(Array, methods)) methods = [methods];
    resources[resource.path].methods = r.reduce(importMethods, {}, methods);

    return resources;
};

export default r.reduce(importResources, {});
