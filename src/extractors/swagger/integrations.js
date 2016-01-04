import r from "ramda";
import deepmerge from "deepmerge";
import { defReqParams, extractMethods, paramsObj } from "./methods";

let merge = r.curry(deepmerge);

let replaceKey = r.curry((origKey, newKey, obj) => {
    let value = r.path([origKey], obj);
    let updated = r.assoc(newKey, value, obj);
    return r.dissoc(origKey, updated);
});

let defaults = (integration) => {
    return r.merge(integration, {
        httpMethod: "POST",
        type: "AWS"
    });
};

let makeIntegration = r.compose(
    defaults,
    replaceKey("httpMethod", "resourceMethod")
);

export let extract = (spec) => {
    let methods = extractMethods(spec);
    let integrations = r.map(makeIntegration, methods);
    let defaultParams = {
        requestParameters: paramsObj(defReqParams(spec))
    };
    integrations = r.map(merge(defaultParams), integrations);
    return r.map((integration) => r.merge(integration, integration["x-aws-apigateway"]), integrations);
};
