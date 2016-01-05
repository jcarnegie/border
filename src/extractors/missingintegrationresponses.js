import r from "ramda";
import { cmpObjProps } from "../util";
import { extract as apigwExtractIntegrationResponses } from "./apigw/integrationresponses";
import { extract as swaggerExtractIntegrationResponses } from "./swagger/integrationresponses";

export let missingIntegrationResponses = (awsgwResourceData, swaggerSpec) => {
    let apigwIntegrationResponses   = apigwExtractIntegrationResponses(awsgwResourceData);
    let swaggerIntegrationResponses = swaggerExtractIntegrationResponses(swaggerSpec);
    let cmp                         = cmpObjProps(["path", "resourceMethod", "statusCode", "selectionPattern"]);
    let integrationResponsesToAdd   = r.differenceWith(cmp, swaggerIntegrationResponses, apigwIntegrationResponses);
    return integrationResponsesToAdd;
};
