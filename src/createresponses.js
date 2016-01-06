import r from "ramda";
import { renameProp } from "./util";

const VALID_PARAMS = [
    "httpMethod",
    "resourceId",
    "restApiId",
    "statusCode",
    "responseModels",
    "responseParameters"
];

let makeParams = r.compose(
    r.pick(VALID_PARAMS),
    renameProp("resourceMethod", "httpMethod"),
    renameProp("httpMethod", "integrationHttpMethod")
);

export let createResponse = r.curry(async (gw, resources, responseSpec) => {
    let resource = r.find(r.propEq("path", responseSpec.path), resources);
    let resourceId = r.prop("id", resource);
    let params = makeParams(r.merge(responseSpec, { resourceId }));
    return await gw.putMethodResponse(params);
});

export let createResponses = (gw, resources, integrations) => {
    return r.map(createResponse(gw, resources), integrations);
};
