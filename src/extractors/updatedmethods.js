import r from "ramda";
import { cmpObjProps } from "../util";
import { extract as apigwExtractMethods } from "./apigw/methods";
import { extract as swaggerExtractMethods } from "./swagger/methods";

const COMPARE_PROPS = [
    "path",
    "httpMethod",
    "apiKeyRequired",
    "authorizationType"
];

export let updatedMethods = (awsgwResourceData, swaggerSpec) => {
    let apigwMethods    = apigwExtractMethods(awsgwResourceData);
    let swaggerMethods  = swaggerExtractMethods(swaggerSpec);
    let cmp             = (a, b) => {
        let eq = r.and(
            r.equals(a.requestParameters, b.requestParameters),
            cmpObjProps(COMPARE_PROPS, a, b)
        );
        if (cmpObjProps(COMPARE_PROPS, a, b) && !r.equals(a.requestParameters, b.requestParameters)) {
            console.log("reqparams:", a, b);
        }
        return eq;
    };
    let methodsToUpdate = r.differenceWith(cmp, swaggerMethods, apigwMethods);
    return methodsToUpdate;
};
