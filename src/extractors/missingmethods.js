import r from "ramda";
import { cmpObjProps } from "../util";
import { extract as apigwExtractMethods } from "./apigw/methods";
import { extract as swaggerExtractMethods } from "./swagger/methods";

export let missingMethods = (awsgwResourceData, swaggerSpec) => {
    let apigwMethods   = apigwExtractMethods(awsgwResourceData);
    let swaggerMethods = swaggerExtractMethods(swaggerSpec);
    let cmp            = cmpObjProps(["path", "httpMethod"]);
    let methodsToAdd   = r.differenceWith(cmp, swaggerMethods, apigwMethods);
    return methodsToAdd;
};
