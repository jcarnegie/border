import r from "ramda";
import { extractMethods } from "./methods";
import { propagate, propagateAs, ensurePathArray, setIf, propIsNil } from "./util";

const PROPS = [
    "id",
    "path",
    "resourceMethod",
    "statusCode",
    "responseModels",
    "responseParameters"
];

let extractResponses = r.compose(
    r.map(setIf(propIsNil("responseParameters"), "responseParameters", {})),
    r.map(setIf(propIsNil("responseModels"), "responseModels", {})),
    r.flatten,
    r.map(r.pathOr([], ["_embedded", "method:responses"])),
    r.map(propagateAs("httpMethod", "resourceMethod", ["_embedded", "method:responses"])),
    r.map(propagate("path", ["_embedded", "method:responses"])),
    r.map(propagate("id", ["_embedded", "method:responses"])),
    r.map(ensurePathArray(["_embedded", "method:responses"])),
    extractMethods
);

export let extract = r.compose(
    r.map(r.pick(PROPS)),
    extractResponses
);
