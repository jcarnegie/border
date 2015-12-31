import r from "ramda";
import { subpaths } from "../util";
import { extract as apigwExtractResources } from "./apigw/resources";
import { extract as swaggerExtractResources } from "./swagger/resources";

export let missingResourcePaths = (awsgwResourceData, swaggerSpec) => {
    let apigwResources   = apigwExtractResources(awsgwResourceData);
    let swaggerResources = swaggerExtractResources(swaggerSpec);
    let mapPath          = r.map(r.prop("path"));
    let apigwPaths       = mapPath(apigwResources);
    let swaggerPaths     = mapPath(swaggerResources);
    let missingPaths     = r.difference(swaggerPaths, apigwPaths);
    let pathsToAdd       = r.sort(r.gt, subpaths(missingPaths));
    return pathsToAdd;
};
