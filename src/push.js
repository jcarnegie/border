import r from "ramda";
import apigateway from "./apigateway";
import { gatewayMethods } from "./gateway";
import { build } from "./swagger";
import { missingResourcePaths } from "./extractors/missingresourcepaths";
import { missingMethods as findMissingMethods } from "./extractors/missingmethods";
import { updatedMethods as findUpdatedMethods } from "./extractors/updatedmethods";
import { createResources } from "./createresources";
import { createMethods } from "./createmethods";

let assocApiId = r.assoc("restApiId");

export let push = r.curry(async (region, apiId, stage) => {
    let gw = gatewayMethods(region);
    let assocApiIds = r.map(assocApiId(apiId));
    let apigwResources = await apigateway.embeddedResources(region, apiId);
    let swaggerSpec = await build(stage);
    let missingPaths = missingResourcePaths(apigwResources, swaggerSpec);
    let missingMethods = findMissingMethods(apigwResources, swaggerSpec);
    let updatedMethods = findUpdatedMethods(apigwResources, swaggerSpec);

    await createResources(region, apiId, apigwResources, missingPaths);
    await createMethods(gw, apigwResources, assocApiIds(missingMethods));
});
