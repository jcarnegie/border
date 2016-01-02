import r from "ramda";
import { extractMethods } from "./methods";
import { propagate, propagateAs, ensurePathArray } from "./util";

const PROPS = [
    "id",
    "path",
    "resourceMethod",
    "cacheKeyParameters",
    "cacheNamespace",
    "httpMethod",
    "type",
    "uri"
];

export let extractIntegrations = r.compose(
    r.flatten,
    r.map(r.pathOr([], ["_embedded", "method:integration"])),
    r.map(propagateAs("httpMethod", "resourceMethod", ["_embedded", "method:integration"])),
    r.map(propagate("path", ["_embedded", "method:integration"])),
    r.map(propagate("id", ["_embedded", "method:integration"])),
    r.map(ensurePathArray(["_embedded", "method:integration"])),
    extractMethods
);

export let extract = r.compose(
    r.map(r.pick(PROPS)),
    extractIntegrations
);
