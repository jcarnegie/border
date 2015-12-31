import r from "ramda";
import { integrationsFull } from "./integrations";
import { propagate, ensurePathArray } from "./util";

let integrationResponsesFull = r.compose(
    r.flatten,
    r.map(r.pathOr([], ["_embedded", "integration:responses"])),
    r.map(propagate("resourceMethod", ["_embedded", "integration:responses"])),
    r.map(propagate("path", ["_embedded", "integration:responses"])),
    r.map(propagate("id", ["_embedded", "integration:responses"])),
    r.map(ensurePathArray(["_embedded", "integration:responses"])),
    integrationsFull
);

export let integrationResponses = r.compose(
    r.map(r.pick(["id", "path", "resourceMethod", "statusCode", "selectionPattern", "responseParameters", "responseTemplates"])),
    integrationResponsesFull
);
