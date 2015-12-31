import r from "ramda";
import apigateway from "./apigateway";
import { build } from "./swagger";
import { missingResourcePaths } from "./extractors/missingresourcepaths";
import { createResources } from "./createresources";

export let push = r.curry(async (region, apiId, stage) => {
    let apigwResources = await apigateway.embeddedResources(region, apiId);
    let swaggerSpec = await build(stage);
    let missingPaths = missingResourcePaths(apigwResources, swaggerSpec);
    return await createResources(region, apiId, apigwResources, missingPaths);
});
