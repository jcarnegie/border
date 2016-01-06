import r from "ramda";
import apigateway from "./apigateway";
import { gatewayMethods } from "./gateway";
import { build } from "./swagger";
import { missingResourcePaths } from "./extractors/missingresourcepaths";
import { missingMethods as findMissingMethods } from "./extractors/missingmethods";
// import { updatedMethods as findUpdatedMethods } from "./extractors/updatedmethods";
import { missingIntegrations as findMissingIntegrations } from "./extractors/missingintegrations";
import { missingIntegrationResponses as findMissingIntegrationResponses } from "./extractors/missingintegrationresponses";
import { missingResponses as findMissingResponses } from "./extractors/missingresponses";
import { createResources } from "./createresources";
import { createMethods } from "./createmethods";
import { createIntegrations } from "./createintegrations";
import { createIntegrationResponses } from "./createintegrationresponses";
import { createResponses } from "./createresponses";

let assocApiIdProp = r.assoc("restApiId");

export let push = r.curry(async (region, apiId, stage) => {
    let gw = gatewayMethods(region);
    let assocApiId = r.map(assocApiIdProp(apiId));
    let apigwResources = await apigateway.embeddedResources(region, apiId);
    let swaggerSpec = await build(stage);
    let missingPaths = missingResourcePaths(apigwResources, swaggerSpec);
    let missingMethods = findMissingMethods(apigwResources, swaggerSpec);
    // let updatedMethods = findUpdatedMethods(apigwResources, swaggerSpec);
    let missingIntegrations = findMissingIntegrations(apigwResources, swaggerSpec);
    let missingIntegrationResponses = findMissingIntegrationResponses(apigwResources, swaggerSpec);
    let missingResponses = findMissingResponses(apigwResources, swaggerSpec);

    await createResources(region, apiId, apigwResources, missingPaths);
    await createMethods(gw, apigwResources, assocApiId(missingMethods));
    await createIntegrations(gw, apigwResources, assocApiId(missingIntegrations));
    await createIntegrationResponses(gw, apigwResources, assocApiId(missingIntegrationResponses));
    await createResponses(gw, apigwResources, assocApiId(missingResponses));
});
