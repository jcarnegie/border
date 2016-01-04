import r from "ramda";
import { collapseSpec } from "./methods";

const PROPS = [
    "path",
    "httpMethod",
    "statusCode",
    "selectionPattern"
];

let expandResponses = r.curry((method) => {
    let expand = r.curry((method, response, statusCode) => {
        let oPath = ["x-aws-apigateway", "selectionPattern"];
        let selectionPatternOverride = r.path(oPath, response);
        let expanded = r.merge(method, {
            statusCode,
            responseDescription: response.description,
            selectionPattern: selectionPatternOverride
                ? selectionPatternOverride
                : (statusCode === "200")
                    ? null
                    : statusCode
        });
        return expanded;
    });
    return r.values(r.mapObjIndexed(expand(method), method.responses));
});

export let extractIntegrationResponses = r.compose(
    r.map(r.pick(PROPS)),
    r.flatten,
    r.values,
    r.mapObjIndexed(expandResponses),
    r.flatten,
    r.values,
    r.mapObjIndexed(collapseSpec),
    r.prop("paths")
);

export let extract = (spec) => {
    return extractIntegrationResponses(spec);
};
