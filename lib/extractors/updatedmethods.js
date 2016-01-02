"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.updatedMethods = undefined;

var _ramda = require("ramda");

var _ramda2 = _interopRequireDefault(_ramda);

var _util = require("../util");

var _methods = require("./apigw/methods");

var _methods2 = require("./swagger/methods");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var COMPARE_PROPS = ["path", "httpMethod", "apiKeyRequired", "authorizationType"];

var updatedMethods = exports.updatedMethods = function updatedMethods(awsgwResourceData, swaggerSpec) {
    var apigwMethods = (0, _methods.extract)(awsgwResourceData);
    var swaggerMethods = (0, _methods2.extract)(swaggerSpec);
    var cmp = function cmp(a, b) {
        var eq = _ramda2.default.and(_ramda2.default.equals(a.requestParameters, b.requestParameters), (0, _util.cmpObjProps)(COMPARE_PROPS, a, b));
        if ((0, _util.cmpObjProps)(COMPARE_PROPS, a, b) && !_ramda2.default.equals(a.requestParameters, b.requestParameters)) {
            console.log("reqparams:", a, b);
        }
        return eq;
    };
    var methodsToUpdate = _ramda2.default.differenceWith(cmp, swaggerMethods, apigwMethods);
    return methodsToUpdate;
};
