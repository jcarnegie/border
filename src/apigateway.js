import r from "ramda";
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
        body: {
            pathPart,
            name: pathPart.replace(/\{\}/, "")
        }
    });
};

let method = async (region, apiId, parentResourceId, method) => {
    return await awsreq.get({
        region,
        host:  `apigateway.${region}.amazonaws.com`,
        path:  `/restapis/${apiId}/resources/${parentResourceId}/methods/${method.toUpperCase()}`
    });
};

let createMethod = async (region, apiId, parentResourceId, method, requestParams) => {
    let newMethUrl = `/restapis/${apiId}/resources/${parentResourceId}/methods/${method.toUpperCase()}`;
    let params = {
        region,
        host:  `apigateway.${region}.amazonaws.com`,
        path:  newMethUrl,
        body: {
            authorizationType: "NONE",
            requestParameters: requestParams
        }
    };
    return await awsreq.put(params);
};

let updateMethod = async (region, apiId, parentResourceId, method, requestParams = {}) => {
    let methodUrl = `/restapis/${apiId}/resources/${parentResourceId}/methods/${method.toUpperCase()}`;
    let patchOp = param => {
        return { op: "add", path: `/requestParameters/${param}` };
    };
    return await awsreq.patch({
        region,
        host:  `apigateway.${region}.amazonaws.com`,
        path:  methodUrl,
        body: {
            patchOperations: r.map(patchOp, r.keys(requestParams))
        }
    });
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

let updateIntegration =  async (opts) => {
    let ops = [
        { op: "replace", path: "/httpMethod", value: opts.httpMethod },
        { op: "replace", path: "/uri", value: opts.uri },
        { op: "replace", path: "/credentials", value: opts.credentials },
        { op: "replace", path: "/requestTemplates/application~1json", value: opts.requestTemplates }
    ];

    return await awsreq.patch({
        region: opts.region,
        host:   `apigateway.${opts.region}.amazonaws.com`,
        path:   `/restapis/${opts.apiId}/resources/${opts.resourceId}/methods/${opts.method.toUpperCase()}/integration`,
        body:   { patchOperations: ops }
    });
};


let createMethodResponse = async(region, apiId, resourceId, method, statusCode, responseParameters = {}, responseModels = {}) => {
    return await awsreq.put({
        region,
        host:   `apigateway.${region}.amazonaws.com`,
        path:   `/restapis/${apiId}/resources/${resourceId}/methods/${method.toUpperCase()}/responses/${statusCode}`,
        body:   {
            responseModels,
            responseParameters
        }
    });
};

let updateMethodResponse = async(region, apiId, resourceId, method, statusCode, responseParameters = {}) => {
    let genOp = (param) => {
        return {
            op: "add",
            path: `/responseParameters/${param}`
        };
    };

    let ops = r.map(genOp, r.keys(responseParameters));
    return await awsreq.patch({
        region,
        host:   `apigateway.${region}.amazonaws.com`,
        path:   `/restapis/${apiId}/resources/${resourceId}/methods/${method.toUpperCase()}/responses/${statusCode}`,
        body:   {
            patchOperations: ops
        }
    });
};

let createIntegrationResponse = async(region, apiId, resourceId, method, statusCode, selectionPattern) => {
    let params = {
        region,
        host:   `apigateway.${region}.amazonaws.com`,
        path:   `/restapis/${apiId}/resources/${resourceId}/methods/${method.toUpperCase()}/integration/responses/${statusCode}`,
        body:   {
            selectionPattern,
            responseTemplates: { "application/json": null }
        }
    };
    return await awsreq.put(params);
};

let deployments = async (region, apiId) => {
    return await awsreq.get({
        region,
        host: `apigateway.${region}.amazonaws.com`,
        path: `/restapis/${apiId}/deployments`
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
    createMethod,
    updateMethod,
    createIntegration,
    updateIntegration,
    createMethodResponse,
    updateMethodResponse,
    createIntegrationResponse,
    deployments,
    deploy,
    stages
};
