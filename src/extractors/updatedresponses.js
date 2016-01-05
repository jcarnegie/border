import r from "ramda";
import { cmpObjProps, updatedSetElements } from "../util";
import { extract as apigwExtractResponses } from "./apigw/responses";
import { extract as swaggerExtractResponses } from "./swagger/responses";

const COMPARE_PROPS = [
    "path",
    "resourceMethod",
    "statusCode"
];

const DIFF_PROPS = [
    "responseModels",
    "responseParameters"
];

export let updatedResponses = (awsgwResourceData, swaggerSpec) => {
    let apigwResponses   = apigwExtractResponses(awsgwResourceData);
    let swaggerResponses = swaggerExtractResponses(swaggerSpec);
    let diffPred = (a, b) => r.equals(
        r.pick(DIFF_PROPS, a),
        r.pick(DIFF_PROPS, b)
    );
    let responsesToUpdate = updatedSetElements(
        cmpObjProps(COMPARE_PROPS),
        diffPred,
        apigwResponses,
        swaggerResponses
    );
    return responsesToUpdate;
};
