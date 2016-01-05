import r from "ramda";
import { cmpObjProps, updatedSetElements } from "../util";
import { extract as apigwExtractIntegrationResponses } from "./apigw/integrationresponses";
import { extract as swaggerExtractIntegrationResponses } from "./swagger/integrationresponses";

const ID_PROPS = [
    "path",
    "resourceMethod",
    "statusCode"
];

const COMPARE_PROPS = r.append("selectionPattern", ID_PROPS);

/**
 * Comparing:
 *
 * 1. DON'T include newly added items for update
 * 2.
 */

export let updatedIntegrationResponses = (awsgwResourceData, swaggerSpec) => {
    let apigwIntegrationResponses    = apigwExtractIntegrationResponses(awsgwResourceData);
    let swaggerIntegrationResponses  = swaggerExtractIntegrationResponses(swaggerSpec);
    let integrationResponsesToUpdate = updatedSetElements(
        cmpObjProps(ID_PROPS),
        cmpObjProps(COMPARE_PROPS),
        apigwIntegrationResponses,
        swaggerIntegrationResponses
    );
    return integrationResponsesToUpdate;
};
