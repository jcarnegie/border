import r from "ramda";
import fs from "fs";
import awsreq from "../lib/awsrequest";

let restapis = async (region) => {
    let reg = region || process.env.AWS_DEFAULT_REGION;
    let data = await awsreq.get({
        host: `apigateway.${reg}.amazonaws.com`,
        region: reg,
        path: "/restapis"
    });

    // empty case - i.e. no APIs defined yet
    if (!data._embedded) return []; // eslint-disable-line no-underscore-dangle

    let apis = data._embedded.item; // eslint-disable-line no-underscore-dangle
    // if there's only one API, then AWS returns an object, not an array
    if (!r.is(Array, apis)) apis = [apis];
    return apis;
};

let createRestapi = r.curry(async (region, name, description) => {
    return await awsreq.post({
        region,
        host:   `apigateway.${region}.amazonaws.com`,
        path:   "/restapis",
        body: { name, description }
    });
});

let resources = r.curry(async (region, apiId) => {
    let res = await awsreq.get({
        region,
        host:   `apigateway.${region}.amazonaws.com`,
        path:   `/restapis/${apiId}/resources`
    });
    res = res._embedded.item; // eslint-disable-line
    if (!r.is(Array, res)) res = [res];
    return res;
});

let createResource = async (region, apiId, parentResourceId, pathPart) => {
    let newResUrl = `/restapis/${apiId}/resources/${parentResourceId}`;
    return await awsreq.post({
        region,
        host:  `apigateway.${region}.amazonaws.com`,
        path:  newResUrl,
        body: { pathPart }
    });
};

let method = async (region, apiId, parentResourceId, method) => {
    return await awsreq.get({
        region,
        host:  `apigateway.${region}.amazonaws.com`,
        path:  `/restapis/${apiId}/resources/${parentResourceId}/methods/${method.toUpperCase()}`
    });
};

let updateMethod = async (region, apiId, parentResourceId, method, requestParams = {}) => {
    console.log("requestParams:", requestParams);
    let resp = null;
    try {
        let newMethUrl = `/restapis/${apiId}/resources/${parentResourceId}/methods/${method.toUpperCase()}`;
        resp = await awsreq.put({
            region,
            host:  `apigateway.${region}.amazonaws.com`,
            path:  newMethUrl,
            body: {
                authorizationType: "NONE",
                requestParameters: requestParams
            }
        });
    } catch (e) {
        console.error(e, e.stack);
    }

    console.log("resp:", resp);

    return resp;
};

let createIntegration = async (opts) => {
    let props = [
        "type",
        "httpMethod",
        "authorizationType",
        "uri",
        "credentials",
        "requestParameters",
        "requestTemplates",
        "cacheNamespace",
        "cacheKeyParameters"
    ];

    return await awsreq.put({
        region: opts.region,
        host:   `apigateway.${opts.region}.amazonaws.com`,
        path:   `/restapis/${opts.apiId}/resources/${opts.resourceId}/methods/${opts.method.toUpperCase()}/integration`,
        body:   r.pick(props, opts)
    });
};

let deployments = async (region, apiId) => {
    return await awsreq.get({
        region,
        host: `apigateway.${region}.amazonaws.com`,
        path: `/restapis/${apiId}/deployments`,
    });
};

let deploy = async (region, apiId, stageName, stageDescription, description) => {
    return await awsreq.post({
        region,
        host: `apigateway.${region}.amazonaws.com`,
        path: `/restapis/${apiId}/deployments`,
        body: {
            stageName,
            stageDescription,
            description
        }
    });
};

let stages = async (region, apiId) => {
    return await awsreq.get({
        region,
        host: `apigateway.${region}.amazonaws.com`,
        path: `/restapis/${apiId}/stages`
    });
};

export default {
    restapis,
    createRestapi,
    resources,
    createResource,
    method,
    updateMethod,
    createIntegration,
    deployments,
    deploy,
    stages
};
