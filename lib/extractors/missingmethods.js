"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.missingMethods = undefined;

var _ramda = require("ramda");

var _ramda2 = _interopRequireDefault(_ramda);

var _util = require("../util");

var _methods = require("./apigw/methods");

var _methods2 = require("./swagger/methods");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var missingMethods = exports.missingMethods = function missingMethods(awsgwResourceData, swaggerSpec) {
    var apigwMethods = (0, _methods.extract)(awsgwResourceData);
    var swaggerMethods = (0, _methods2.extract)(swaggerSpec);
    var cmp = (0, _util.cmpObjProps)(["path", "httpMethod"]);
    var methodsToAdd = _ramda2.default.differenceWith(cmp, swaggerMethods, apigwMethods);
    return methodsToAdd;
};
