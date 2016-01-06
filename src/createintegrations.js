import r from "ramda";
import { renameProp } from "./util";

const VALID_PARAMS = [
    "httpMethod",
    "resourceId",
    "restApiId",
    "type",
    "cacheKeyParameters",
    "cacheNamespace",
    "credentials",
    "integrationHttpMethod",
    "requestParameters",
    "requestTemplates",
    "uri"
];

let makeParams = r.compose(
    r.pick(VALID_PARAMS),
    renameProp("resourceMethod", "httpMethod"),
    renameProp("httpMethod", "integrationHttpMethod")
);

export let createIntegration = r.curry(async (gw, resources, integrationSpec) => {
    let resource = r.find(r.propEq("path", integrationSpec.path), resources);
    let resourceId = r.prop("id", resource);
    let params = makeParams(r.merge(integrationSpec, { resourceId }));
    return await gw.putIntegration(params);
});

export let createIntegrations = (gw, resources, integrations) => {
    return r.map(createIntegration(gw, resources), integrations);
};
