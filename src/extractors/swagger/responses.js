import r from "ramda";
import { collapseSpec } from "./methods";

const PROPS = [
    "path",
    "resourceMethod",
    "statusCode",
    "responseModels",
    "responseParameters"
];

let expandResponses = r.curry((method) => {
    let expand = r.curry((method, response, statusCode) => {
        let expanded = r.merge(method, {
            resourceMethod: method.httpMethod,
            statusCode,
            responseModels: {},
            responseParameters: {}
        });

        return expanded;
    });
    return r.values(r.mapObjIndexed(expand(method), method.responses));
});

export let extractResponses = r.compose(
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
    return extractResponses(spec);
};
