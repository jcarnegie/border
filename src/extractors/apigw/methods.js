import r from "ramda";
import { propagate, ensurePathArray } from "./util";

export let extractMethods = r.compose(
    r.flatten,
    r.map(r.pathOr([], ["_embedded", "resource:methods"])),
    r.map(propagate("path", ["_embedded", "resource:methods"])),
    r.map(propagate("id", ["_embedded", "resource:methods"])),
    r.map(ensurePathArray(["_embedded", "resource:methods"]))
);

export let extract = r.compose(
    r.map(r.pick(["id", "path", "apiKeyRequired", "authorizationType", "httpMethod", "requestParameters", "requestModels"])),
    extractMethods
);
