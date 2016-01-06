import r from "ramda";
import { renameProp } from "./util";

const VALID_PARAMS = [
    "httpMethod",
    "resourceId",
    "restApiId",
    "statusCode",
    "responseParameters",
    "responseTemplates",
    "selectionPattern"
];

let makeParams = r.compose(
    r.pick(VALID_PARAMS),
    renameProp("resourceMethod", "httpMethod"),
    renameProp("httpMethod", "integrationHttpMethod")
);

export let createIntegrationResponse = r.curry(async (gw, resources, integrationResponseSpec) => {
    let resource = r.find(r.propEq("path", integrationResponseSpec.path), resources);
    let resourceId = r.prop("id", resource);
    let params = makeParams(r.merge(integrationResponseSpec, { resourceId }));
    return await gw.putIntegration(params);
});

export let createIntegrationResponses = (gw, resources, integrations) => {
    return r.map(createIntegrationResponse(gw, resources), integrations);
};
