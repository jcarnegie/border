import r from "ramda";

const VALID_PARAMS = [
    "authorizationType",
    "httpMethod",
    "resourceId",
    "restApiId",
    "apiKeyRequired",
    "requestModels",
    "requestParameters"
];

export let createMethod = r.curry(async (gw, resources, methodSpec) => {
    let resource = r.find(r.propEq("path", methodSpec.path));
    let resourceId = r.prop("id", resource);
    let params = r.pick(VALID_PARAMS, r.merge(methodSpec, { resourceId }));

    console.log("creating method:", params);

    return await gw.createMethod(params);
});

export let createMethods = (gw, resources, methods) => {
    return r.map(createMethod(gw, resources), methods);
};
