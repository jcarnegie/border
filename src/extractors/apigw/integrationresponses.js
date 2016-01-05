import r from "ramda";
import { extractIntegrations } from "./integrations";
import { propagate, ensurePathArray, setIf } from "./util";

const PROPS = [
    "id",
    "path",
    "resourceMethod",
    "statusCode",
    "selectionPattern",
    "responseParameters",
    "responseTemplates"
];

export let extractIntegrationResponses = r.compose(
    r.flatten,
    r.map(r.pathOr([], ["_embedded", "integration:responses"])),
    r.map(propagate("resourceMethod", ["_embedded", "integration:responses"])),
    r.map(propagate("path", ["_embedded", "integration:responses"])),
    r.map(propagate("id", ["_embedded", "integration:responses"])),
    r.map(ensurePathArray(["_embedded", "integration:responses"])),
    extractIntegrations
);

export let extract = r.compose(
    r.map(r.pick(PROPS)),
    r.map(setIf(r.propEq("selectionPattern", undefined), "selectionPattern", null)), // eslint-disable-line
    extractIntegrationResponses
);
