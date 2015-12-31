"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.missingResourcePaths = undefined;

var _ramda = require("ramda");

var _ramda2 = _interopRequireDefault(_ramda);

var _util = require("../util");

var _resources = require("./apigw/resources");

var _resources2 = require("./swagger/resources");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var missingResourcePaths = exports.missingResourcePaths = function missingResourcePaths(awsgwResourceData, swaggerSpec) {
    var apigwResources = (0, _resources.extract)(awsgwResourceData);
    var swaggerResources = (0, _resources2.extract)(swaggerSpec);
    var mapPath = _ramda2.default.map(_ramda2.default.prop("path"));
    var apigwPaths = mapPath(apigwResources);
    var swaggerPaths = mapPath(swaggerResources);
    var missingPaths = _ramda2.default.difference(swaggerPaths, apigwPaths);
    var pathsToAdd = _ramda2.default.sort(_ramda2.default.gt, (0, _util.subpaths)(missingPaths));
    return pathsToAdd;
};
