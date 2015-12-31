import r from "ramda";
import { methodsFull } from "./methods";
import { propagate, propagateAs, ensurePathArray } from "./util";

export let integrationsFull = r.compose(
    r.flatten,
    r.map(r.pathOr([], ["_embedded", "method:integration"])),
    r.map(propagateAs("httpMethod", "resourceMethod", ["_embedded", "method:integration"])),
    r.map(propagate("path", ["_embedded", "method:integration"])),
    r.map(propagate("id", ["_embedded", "method:integration"])),
    r.map(ensurePathArray(["_embedded", "method:integration"])),
    methodsFull
);

export let integrations = r.compose(
    r.map(r.pick(["id", "path", "resourceMethod", "cacheKeyParameters", "cacheNamespace", "httpMethod", "type", "uri"])),
    integrationsFull
);
