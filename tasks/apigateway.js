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

let updateMethod = async (region, apiId, parentResourceId, method) => {
    let newMethUrl = `/restapis/${apiId}/resources/${parentResourceId}/methods/${method.toUpperCase()}`;
    return await awsreq.put({
        region,
        host:  `apigateway.${region}.amazonaws.com`,
        path:  newMethUrl,
        body: {
            authorizationType: "NONE",
            requestParameters: {}
        }
    });
};


// let resource = r.curry(async (region, apiId, resourceId) => {
//     return await awsreq.get({
//         region,
//         host:   `apigateway.${region}.amazonaws.com`,
//         path:   `/restapis/${apiId}/resources/${resourceId}`
//     });
//
//     // resources = resources._embedded.item; // eslint-disable-line
//     // if (r.is(Object, resources)) resources = [resources];
// });

// let method = r.curry(async (region, apiId, resourceId, method) => {
//     return await awsreq.get({
//         region,
//         host:   `apigateway.${region}.amazonaws.com`,
//         path:   `/restapis/${apiId}/resources/${resourceId}/methods/${method.toUpperCase()}`
//     });
// });

// let createIntegration = r.curry(async (opts) => {
//     // let region = opts.region;
//     // let apiId = opts.apiId;
//     // let resourceId = opts.resourceId;
//     // let method = opts.method
//     // let type = opts.type;
//     // let httpMethod = opts.httpMethod;
//     // let uri = opts.uri;
//     // let credentials = opts.credentials;
//     // let requestParameters = opts.requestParameters;
//     // let requestTemplates = opts.requestTemplates;
//     // let cacheNamespace = opts.cacheNamespace;
//     // let cacheKeyParameter = opts.cacheKeyParameter;
//
//     let props = ["type", "httpMethod", "authorizationType", "uri", "credentials", "requestParameters", "requestTemplates", "cacheNamespace", "cacheKeyParameters"];
//
//     // console.log("/restapis/cd14zqypi2/resources/3e5141/methods/POST/integration");
//     // console.log("--or--");
//     // console.log(`/restapis/${opts.apiId}/resources/${opts.resourceId}/methods/${opts.method.toUpperCase()}/integration`);
//
//     return await awsreq.put({
//         region: opts.region,
//         host:   `apigateway.${opts.region}.amazonaws.com`,
//         // path:   "/restapis/cd14zqypi2/resources/3e5141/methods/POST/integration",
//         path:   `/restapis/${opts.apiId}/resources/${opts.resourceId}/methods/${opts.method.toUpperCase()}/integration`,
//         body:   r.pick(props, opts)
//     });
// });

// let create = async (spec, region) => {
//     let name = spec.info.title;
//     let description = spec.info.description;
//     let reg = region || process.env.AWS_DEFAULT_REGION;
//     let apis = await restapis(reg);
//     let api = r.find(r.propEq("name", name), apis);
//
//     if (!api) {
//         api = createRestapi(reg, name, description);
//     }
//
//     let theResources = resources(reg, api.id);
//     // fs.writeFileSync("./test/fixtures/resources-multiple-get.json", JSON.stringify(resources, null, 4));
//
//     // resources = resources._embedded.item; // eslint-disable-line
//     // if (r.is(Object, resources)) resources = [resources];
//
//     // console.log("resources:");
//     // console.log(JSON.stringify(resources, null, 4));
//
//     // let newResUrl = `/restapis/cd14zqypi2/resources/klqt924rw3`;
//     // let newResResp = await awsreq.post({
//     //     host:   `apigateway.${reg}.amazonaws.com`,
//     //     region: reg,
//     //     path:   newResUrl,
//     //     body: { pathPart: "hello" }
//     // });
//
//     // newResResp = JSON.stringify(newResResp, null, 4);
//     // fs.writeFileSync("./test/fixtures/resources-post.json", newResResp);
//
//     // let modelsUrl = "/restapis/cd14zqypi2/resources/3e5141";
//     // console.log(`getting: ${modelsUrl}`);
//     // let modelsResp = await awsreq.get({
//     //     host:   `apigateway.${reg}.amazonaws.com`,
//     //     region: reg,
//     //     path:   modelsUrl
//     // });
//     // console.log(JSON.stringify(modelsResp, null, 4));
//     // fs.writeFileSync("./test/fixtures/resource-with-get-method-get.json", JSON.stringify(modelsResp, null, 4));
//
//     let methodsUrl = "/restapis/cd14zqypi2/resources/3e5141/methods/GET";
//     console.log(`getting: ${methodsUrl}`);
//     let methodsResp = await awsreq.get({
//         host:   `apigateway.${reg}.amazonaws.com`,
//         region: reg,
//         path:   methodsUrl
//     });
//     console.log(JSON.stringify(methodsResp, null, 4));
//
//     fs.writeFileSync("./test/fixtures/resource-methods-get-get.json", JSON.stringify(methodsResp, null, 4));
//
//
//
//     // let url = "/restapis/0t4v0noh2h/resources/dxxy9k/methods/PUT";
//     // let blah = await awsreq.get({
//     //     host:   `apigateway.${reg}.amazonaws.com`,
//     //     region: reg,
//     //     path:   url
//     // });
//     // console.log(JSON.stringify(blah, null, 4));
//
//
//     // r.map((resource) => {
//     //
//     // }, resources);
//
//
//
//     return api;
// };

export default {
    // create,
    restapis,
    createRestapi,
    resources,
    createResource,
    updateMethod
    // resource,
    // method,
    // createIntegration,
    // createEndpoint
};
