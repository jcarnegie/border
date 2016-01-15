import r from "ramda";
import { getExistingMethods } from "./methods";
import { propagate, propagateAs, ensurePathArray } from "../util";

const EXISTING_METHOD_PROPS = [
    "id",
    "path",
    "resourceMethod",
    "cacheKeyParameters",
    "cacheNamespace",
    "httpMethod",
    "type",
    "uri"
];

export let getExistingIntegrations = r.compose(
    r.map(r.pick(EXISTING_METHOD_PROPS)),
    r.flatten,
    r.map(r.pathOr([], ["_embedded", "method:integration"])),
    r.map(propagateAs("httpMethod", "resourceMethod", ["_embedded", "method:integration"])),
    r.map(propagate("path", ["_embedded", "method:integration"])),
    r.map(propagate("id", ["_embedded", "method:integration"])),
    r.map(ensurePathArray(["_embedded", "method:integration"])),
    getExistingMethods
);
