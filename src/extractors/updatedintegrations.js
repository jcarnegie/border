import r from "ramda";
import { cmpObjProps } from "../util";
import { extract as apigwExtractIntegrations } from "./apigw/integrations";
import { extract as swaggerExtractIntegrations } from "./swagger/integrations";

const COMPARE_PROPS = [
    "path",
    "resourceMethod",
    "httpMethod",
    "type"
];

export let updatedIntegrations = (awsgwResourceData, swaggerSpec) => {
    let apigwIntegrations    = apigwExtractIntegrations(awsgwResourceData);
    let swaggerIntegrations  = swaggerExtractIntegrations(swaggerSpec);
    let cmp                  = cmpObjProps(COMPARE_PROPS);
    let integrationsToUpdate = r.differenceWith(cmp, swaggerIntegrations, apigwIntegrations);
    return integrationsToUpdate;
};
