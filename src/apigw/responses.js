import r from "ramda";
import { methodsFull } from "./methods";
import { propagate, propagateAs, ensurePathArray } from "./util";

let responsesFull = r.compose(
    r.flatten,
    r.map(r.pathOr([], ["_embedded", "method:responses"])),
    r.map(propagateAs("httpMethod", "resourceMethod", ["_embedded", "method:responses"])),
    r.map(propagate("path", ["_embedded", "method:responses"])),
    r.map(propagate("id", ["_embedded", "method:responses"])),
    r.map(ensurePathArray(["_embedded", "method:responses"])),
    methodsFull
);

export let responses = r.compose(
    r.map(r.pick(["id", "path", "resourceMethod", "statusCode", "responseModels", "responseParameters"])),
    responsesFull
);
