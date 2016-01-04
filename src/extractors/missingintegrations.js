import r from "ramda";
import { cmpObjProps } from "../util";
import { extract as apigwExtractIntegrations } from "./apigw/integrations";
import { extract as swaggerExtractIntegrations } from "./swagger/integrations";

export let missingIntegrations = (awsgwResourceData, swaggerSpec) => {
    let apigwIntegrations   = apigwExtractIntegrations(awsgwResourceData);
    let swaggerIntegrations = swaggerExtractIntegrations(swaggerSpec);
    let cmp                 = cmpObjProps(["path", "httpMethod"]);
    let integrationsToAdd   = r.differenceWith(cmp, swaggerIntegrations, apigwIntegrations);
    return integrationsToAdd;
};
