import r from "ramda";
import deepmerge from "deepmerge";

const PROPS = [
    "path",
    "httpMethod",
    "authorizationType",
    "apiKeyRequired",
    "requestParameters",
    "x-aws-apigateway"
];

const DEFAULTS = {
    authorizationType: "NONE",
    apiKeyRequired: false
};

let merge = r.curry(deepmerge);

// translate swagger param type to AWS param type
let awsType = type => (type === "query") ? "querystring" : type;
// translate a swagger param to an AWS param
let awsParams = (params, type) => r.map((param) => `method.request.${awsType(type)}.${param}`, params);

export let defReqParams = (spec) => {
    let defParamsPath = ["info", "x-aws-apigateway", "default-request-params"];
    let defParams = r.pathOr({}, defParamsPath, spec);
    let awsDefParams = r.mapObjIndexed(awsParams, defParams);
    return r.flatten(r.values(awsDefParams));
};

export let paramsObj = (params) => {
    let vals = r.map(() => true, r.range(0, r.length(params)));
    return r.zipObj(params, vals);
};

let extractParams = (spec) => {
    let params = spec.parameters || [];
    let queryparams = awsParams(r.map(r.prop("name"), r.filter(r.propEq("in", "query"), params)), "query");
    let pathparams = awsParams(r.map(r.prop("name"), r.filter(r.propEq("in", "path"), params)), "path");
    let headers = awsParams(r.map(r.prop("name"), r.filter(r.propEq("in", "header"), params)), "header");
    params = r.concat(r.concat(queryparams, pathparams), headers);
    return paramsObj(params);
};

let extendSpec = r.curry((path, spec, method) => {
    let extSpec = r.clone(spec);
    extSpec.path = path;
    extSpec.httpMethod = r.toUpper(method);
    extSpec.requestParameters = extractParams(spec);
    return extSpec;
});

export let collapseSpec = (methods, path) => {
    return r.values(
        r.mapObjIndexed(
            extendSpec(path),
            methods
        )
    );
};

export let extractMethods = r.compose(
    r.map(r.merge(DEFAULTS)),
    r.map(r.pick(PROPS)),
    r.flatten,
    r.values,
    r.mapObjIndexed(collapseSpec),
    r.prop("paths")
);

export let extract = (spec) => {
    let methods = extractMethods(spec);
    let defaultParams = {
        requestParameters: paramsObj(defReqParams(spec))
    };
    methods = r.map(merge(defaultParams), methods);
    return r.map((method) => r.merge(method, method["x-aws-apigateway"]), methods);
};
