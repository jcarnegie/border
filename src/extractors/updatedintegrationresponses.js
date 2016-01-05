import r from "ramda";
import { cmpObjProps } from "../util";
import { extract as apigwExtractIntegrationResponses } from "./apigw/integrationresponses";
import { extract as swaggerExtractIntegrationResponses } from "./swagger/integrationresponses";

const INTERSECT_PROPS = [
    "path",
    "resourceMethod",
    "statusCode"
];

/**
 * Comparing:
 *
 * 1. DON'T include newly added items for update
 * 2.
 */

export let updatedIntegrationResponses = (awsgwResourceData, swaggerSpec) => {
    let apigwIntegrationResponses    = apigwExtractIntegrationResponses(awsgwResourceData);
    let swaggerIntegrationResponses  = swaggerExtractIntegrationResponses(swaggerSpec);
    let intersectCompare             = cmpObjProps(INTERSECT_PROPS);
    let existingIntegrationResponses = r.intersectionWith(intersectCompare, apigwIntegrationResponses, swaggerIntegrationResponses);
    let diffCompare                  = cmpObjProps(r.append("selectionPattern", INTERSECT_PROPS));
    let integrationResponsesToUpdate = r.differenceWith(diffCompare, existingIntegrationResponses, swaggerIntegrationResponses);
    return integrationResponsesToUpdate;
};
