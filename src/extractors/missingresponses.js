import r from "ramda";
import { cmpObjProps } from "../util";
import { extract as apigwExtractResponses } from "./apigw/responses";
import { extract as swaggerExtractResponses } from "./swagger/responses";

const COMPARE_PROPS = [
    "path",
    "resourceMethod",
    "statusCode"
];

export let missingResponses = (awsgwResourceData, swaggerSpec) => {
    let apigwResponses   = apigwExtractResponses(awsgwResourceData);
    let swaggerResponses = swaggerExtractResponses(swaggerSpec);
    let cmp              = (a, b) => {
        return r.and(
            r.equals(a.requestModels, b.requestModels),
            r.and(
                r.equals(a.requestParameters, b.requestParameters),
                cmpObjProps(COMPARE_PROPS, a, b)
            )
        );
    };
    let responsesToAdd   = r.differenceWith(cmp, swaggerResponses, apigwResponses);
    return responsesToAdd;
};
