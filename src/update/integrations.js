import r from "ramda";
import AWS from "aws-sdk";
import Promise from "bluebird";
import { getExistingMethods, getSwaggerMethods } from "./methods";
import {
    renameKey,
    compareProps,
    propagate,
    propagateAs,
    ensurePathArray
} from "../util";

const EXISTING_INTEGRATION_PROPS = [
    "restApiId",
    "resourceId",
    "id",
    "path",
    "cacheKeyParameters",
    "cacheNamespace",
    "credentials",
    "httpMethod",
    "integrationHttpMethod",
    "integrationRequestParameters",
    "requestTemplates",
    "type",
    "uri"
];

const SWAGGER_INTEGRATION_PROPS = [
    "restApiId",
    "resourceId",
    "id",
    "path",
    "cacheKeyParameters",
    "cacheNamespace",
    "credentials",
    "httpMethod",
    "integrationHttpMethod",
    "integrationRequestParameters",
    "requestTemplates",
    "type",
    "uri"
];

const UPDATE_COMPARE_PROPS = [
    "path",
    "cacheKeyParameters",
    "cacheNamespace",
    "credentials",
    "httpMethod",
    "integrationHttpMethod",
    "integrationRequestParameters",
    "requestTemplates",
    "type",
    "uri"
];

let gateway = new AWS.APIGateway();
let putIntegration = Promise.promisify(gateway.putIntegration.bind(gateway));
let updateIntegration = Promise.promisify(gateway.updateIntegration.bind(gateway));

export let getExistingIntegrations = r.compose(
    r.map(renameKey("resourceMethod", "httpMethod")),
    r.map(renameKey("httpMethod", "integrationHttpMethod")),
    r.flatten,
    r.map(r.pathOr([], ["_embedded", "method:integration"])),
    r.map(propagateAs("httpMethod", "resourceMethod", ["_embedded", "method:integration"])),
    r.map(propagate("path", ["_embedded", "method:integration"])),
    r.map(propagate("id", ["_embedded", "method:integration"])),
    r.map(ensurePathArray(["_embedded", "method:integration"])),
    getExistingMethods
);

export let getSwaggerIntegrations = (swaggerApi) => {
    return getSwaggerMethods(swaggerApi);
};

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


let compareNewMethods = compareProps(["path", "httpMethod", "type"]);

let compareUpdatedMethods = compareProps(UPDATE_COMPARE_PROPS);

let diffForNew = r.differenceWith(compareNewMethods);

let diffForUpdate = r.differenceWith(compareUpdatedMethods);

let intersectForUpdate = r.intersectionWith(compareNewMethods);

let updateIntegrations = async (existingIntegrations, swaggerIntegrations, updatedIntegrations) => {
    let paramsList = r.map((updatedMethod) => {
        let path = r.prop("path", updatedMethod);
        let httpMethod = r.prop("httpMethod", updatedMethod);
        let pred = r.both(r.propEq("path", path), r.propEq("httpMethod", httpMethod));
        let existingIntegration = r.find(pred, existingIntegrations);
        let swaggerIntegration = r.find(pred, swaggerIntegrations);

        // console.log(swaggerIntegration);

        let integrationHttpMethod = r.prop("integrationHttpMethod", swaggerIntegration);
        let uri = r.propOr(null, "uri", swaggerIntegration);
        let credentials = r.propOr(null, "credentials", swaggerIntegration);
        let cacheNamespace = r.prop("cacheNamespace", swaggerIntegration);
        let requestTemplates = r.prop("requestTemplates", swaggerIntegration);

        let ops = [
            { op: "replace", path: "/httpMethod", value: integrationHttpMethod },
            { op: "replace", path: "/uri", value: uri },
            { op: "replace", path: "/credentials", value: credentials },
            { op: "replace", path: "/cacheNamespace", value: cacheNamespace },
            { op: "replace", path: "/requestTemplates/application~1json", value: requestTemplates["application/json"]}
        ];

        return r.merge(
            r.pick(["httpMethod", "resourceId", "restApiId"], existingIntegration),
            { patchOperations: ops }
        );
    }, updatedIntegrations);

    // console.log("paramsList:", JSON.stringify(paramsList, null, 4));
    return r.map(updateIntegration, paramsList);
};

export let update = async (apiId, existingApi, swaggerApi) => {
    let assocData = r.compose(
        assocApiId(apiId),
        assocResourceId(existingApi),
        assocCacheNamespace(existingApi)
    );

    let existingIntegrations = r.map(assocData, r.map(r.pick(EXISTING_INTEGRATION_PROPS), getExistingIntegrations(existingApi)));
    let swaggerIntegrations = r.map(assocData, r.map(r.pick(SWAGGER_INTEGRATION_PROPS), getSwaggerIntegrations(swaggerApi)));
    let newIntegrations = diffForNew(swaggerIntegrations, existingIntegrations);
    let intersectingIntegrations = intersectForUpdate(existingIntegrations, swaggerIntegrations);
    let updatedIntegrations = diffForUpdate(intersectingIntegrations, swaggerIntegrations);
    let createPromises = r.map(putIntegration, newIntegrations);
    let updatePromises = updateIntegrations(existingIntegrations, swaggerIntegrations, updatedIntegrations);

    return Promise.all(r.concat(createPromises, updatePromises));
};
