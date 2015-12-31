"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.missingResourcePaths = undefined;

var _ramda = require("ramda");

var _ramda2 = _interopRequireDefault(_ramda);

var _util = require("../util");

var _resources = require("../apigw/resources");

var apigw = _interopRequireWildcard(_resources);

var _resources2 = require("../swagger/resources");

var swagger = _interopRequireWildcard(_resources2);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var missingResourcePaths = exports.missingResourcePaths = function missingResourcePaths(awsgwResourceData, swaggerSpec) {
    var apigwResources = apigw.resources(awsgwResourceData);
    var swaggerResources = swagger.resources(swaggerSpec);
    var apigwPaths = _ramda2.default.map(_ramda2.default.prop("path"), apigwResources);
    var swaggerPaths = _ramda2.default.map(_ramda2.default.prop("path"), swaggerResources);
    var missingPaths = _ramda2.default.difference(swaggerPaths, apigwPaths);
    var pathsToAdd = _ramda2.default.sort(_ramda2.default.gt, (0, _util.subpaths)(missingPaths));
    return pathsToAdd;
};
