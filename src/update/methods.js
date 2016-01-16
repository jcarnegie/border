import r from "ramda";
import AWS from "aws-sdk";
import Promise from "bluebird";
import { compareProps, propagate, ensurePathArray } from "../util";

const EXISTING_METHOD_PROPS = [
    "id",
    "path",
    "apiKeyRequired",
    "authorizationType",
    "httpMethod",
    "requestParameters",
    "requestModels"
];

const SWAGGER_METHOD_PROPS = [
    "id",
    "path",
    "resourceId",
    "apiKeyRequired",
    "authorizationType",
    "httpMethod",
    "requestParameters",
    "requestModels",
    "cacheNamespace"
];

const SWAGGER_METHOD_DEFAULTS = {
    authorizationType: "NONE",
    apiKeyRequired: false
};

const SWAGGER_INTEGRATION_DEFAULTS = {
    type: "AWS",
    integrationHttpMethod: "POST"
};

const PUT_METHOD_PROPS = [
    "restApiId",
    "resourceId",
    "httpMethod",
    "apiKeyRequired",
    "authorizationType",
    "requestParameters"
];

let gateway = new AWS.APIGateway();
let putMethod = Promise.promisify(gateway.putMethod.bind(gateway));
let updateMethod = Promise.promisify(gateway.updateMethod.bind(gateway));

export let getExistingMethods = r.compose(
    r.flatten,
    r.map(r.pathOr([], ["_embedded", "resource:methods"])),
    r.map(propagate("path", ["_embedded", "resource:methods"])),
    r.map(propagate("id", ["_embedded", "resource:methods"])),
    r.map(ensurePathArray(["_embedded", "resource:methods"]))
);

export let getSwaggerMethods = (swaggerApi) => {
    let defReqParams = (swaggerApi) => {
        let defParamsPath = ["info", "x-aws-apigateway", "default-request-params"];
        let defParams = r.pathOr({}, defParamsPath, swaggerApi);
        let awsType = type => (type === "query") ? "querystring" : type;
        let awsParams = (params, type) => r.map((param) => `method.request.${awsType(type)}.${param}`, params);
        let awsDefParams = r.mapObjIndexed(awsParams, defParams);
        let assocParam = (params, param) => r.assoc(param, true, params);
        return r.reduce(assocParam, {}, r.flatten(r.values(awsDefParams)));
    };

    let requestParams = (method) => {
        let params = r.reduce((params, param) => {
            let type = (param.in === "query") ? "querystring" : param.in;
            return r.assoc(`method.request.${type}.${param.name}`, true, params);
        }, {}, r.prop("parameters", method));
        return r.merge(defReqParams(swaggerApi), params);
    };

    let requestTemplates = (method) => {
        let params = r.prop("requestParameters", method);
        let paramNames = r.map(r.compose(r.last, r.split(".")), r.keys(params));
        let requestTemplates = {};
        if (paramNames.length > 0) {
            let contentType = "application/json";
            let templates = {};
            r.map(param => templates[param] = `$input.params('${param}')`, paramNames);
            templates.body = "$input.json('$')";
            let templateStr = JSON.stringify(templates);
            let match = "\"$input.json('$')\"";
            let replacement = "$input.json('$$')";
            requestTemplates[contentType] = templateStr.replace(match, replacement);
        }
        return requestTemplates;
    };

    return r.flatten(
        r.values(
            r.mapObjIndexed((methods, path) => {
                return r.values(
                    r.mapObjIndexed((method, httpMethod) => {
                        method = r.merge(method, SWAGGER_METHOD_DEFAULTS);
                        method = r.merge(method, SWAGGER_INTEGRATION_DEFAULTS);
                        method = r.merge(method, r.propOr({}, "x-aws-apigateway", method));
                        method = r.assoc("path", path, method);
                        method = r.assoc("httpMethod", r.toUpper(httpMethod), method);
                        method = r.assoc("requestParameters", requestParams(method), method);
                        return r.assoc("requestTemplates", requestTemplates(method), method);
                    }, methods)
                );
            }, r.prop("paths", swaggerApi))
        )
    );
};

let compareNewMethods = compareProps(["path", "httpMethod"]);

let compareUpdatedMethods = compareProps(["path", "httpMethod", "apiKeyRequired", "authorizationType"]);

let diffForNew = r.differenceWith(compareNewMethods);

let diffForUpdate = r.differenceWith(compareUpdatedMethods);

let intersectForUpdate = r.intersectionWith(compareNewMethods);

let assocApiId = r.assoc("restApiId");

let assocResourceId = r.curry((existingApi, method) => {
    let path = r.prop("path", method);
    let existingMethod = r.find(r.propEq("path", path), existingApi);
    let resourceId = r.prop("id", existingMethod);
    return r.assoc("resourceId", resourceId, method);
});

let assocCacheNamespace = r.curry((existingApi, method) => {
    let path = r.prop("path", method);
    let existingMethod = r.find(r.propEq("path", path), existingApi);
    let resourceId = r.prop("id", existingMethod);
    return r.assoc("cacheNamespace", resourceId, method);
});

let updateMethods = async (existingMethods, swaggerMethods, updatedMethods) => {
    let paramsList = r.map((updatedMethod) => {
        let path = r.prop("path", updatedMethod);
        let httpMethod = r.prop("httpMethod", updatedMethod);
        let pred = r.both(r.propEq("path", path), r.propEq("httpMethod", httpMethod));
        let existingMethod = r.find(pred, existingMethods);
        let swaggerMethod = r.find(pred, swaggerMethods);

        let authorizationType = r.prop("authorizationType", swaggerMethod);
        let apiKeyRequired = r.prop("apiKeyRequired", swaggerMethod);

        let ops = [
            { op: "replace", path: "/authorizationType", value: authorizationType },
            { op: "replace", path: "/apiKeyRequired", value: apiKeyRequired }
        ];

        let paramOp = r.curry((op, param) => {
            return { op, path: `/requestParameters/${param}` };
        });

        let paramsWithDefault = r.propOr({}, "requestParameters");
        let newRequestParams = r.difference(
            r.keys(paramsWithDefault(swaggerMethod)),
            r.keys(paramsWithDefault(existingMethod))
        );

        ops = r.concat(ops, r.map(paramOp("add"), newRequestParams));

        let deletedRequestParams = r.difference(
            r.keys(paramsWithDefault(existingMethod)),
            r.keys(paramsWithDefault(swaggerMethod))
        );

        ops = r.concat(ops, r.map(paramOp("remove"), deletedRequestParams));

        return r.merge(
            r.pick(["httpMethod", "resourceId", "restApiId"], existingMethod),
            { patchOperations: ops }
        );
    }, updatedMethods);

    return r.map(updateMethod, paramsList);
};

/*
 * From AWS API Gateway console:
 *
 * updateMethod params to update authorizationType:
 *     {op: "replace", path: "/authorizationType", value: "AWS_IAM"}
 * updateMethod params to update apiKeyRequired:
 *     {op: "replace", path: "/apiKeyRequired", value: "true"}
 * updateMethod params to add query param:
 *     {op: "add", path: "/requestParameters/method.request.querystring.testing"}
 * updateMethod params to remove query param:
 *     {op: "remove", path: "/requestParameters/method.request.querystring.testing"}
 * updateMethod params to add request method:
 *     {op: "add", path: "/requestModels/application~1json", value: "Empty"}
 * updateMethod params to remove request method:
 *     {op: "remove", path: "/requestModels/application~1json"}
 */
export let update = async (apiId, existingApi, swaggerApi) => {
    let assocData = r.compose(
        assocApiId(apiId),
        assocResourceId(existingApi),
        assocCacheNamespace(existingApi)
    );

    let existingMethods = r.map(assocData, r.map(r.pick(EXISTING_METHOD_PROPS), getExistingMethods(existingApi)));
    let swaggerMethods = r.map(assocData, r.map(r.pick(SWAGGER_METHOD_PROPS), getSwaggerMethods(swaggerApi)));
    let newMethods = diffForNew(swaggerMethods, existingMethods);
    let intersectingMethods = intersectForUpdate(existingMethods, swaggerMethods);
    let updatedMethods = diffForUpdate(intersectingMethods, swaggerMethods);
    let createPromises = r.compose(r.map(putMethod), r.map(r.pick(PUT_METHOD_PROPS)))(newMethods);
    let updatePromises = updateMethods(existingMethods, swaggerMethods, updatedMethods);

    return await Promise.all(r.concat(createPromises, updatePromises));
};
