"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.missingResponses = undefined;

var _ramda = require("ramda");

var _ramda2 = _interopRequireDefault(_ramda);

var _util = require("../util");

var _responses = require("./apigw/responses");

var _responses2 = require("./swagger/responses");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var COMPARE_PROPS = ["path", "resourceMethod", "statusCode"];

var missingResponses = exports.missingResponses = function missingResponses(awsgwResourceData, swaggerSpec) {
    var apigwResponses = (0, _responses.extract)(awsgwResourceData);
    var swaggerResponses = (0, _responses2.extract)(swaggerSpec);
    var cmp = function cmp(a, b) {
        return _ramda2.default.and(_ramda2.default.equals(a.requestModels, b.requestModels), _ramda2.default.and(_ramda2.default.equals(a.requestParameters, b.requestParameters), (0, _util.cmpObjProps)(COMPARE_PROPS, a, b)));
    };
    var responsesToAdd = _ramda2.default.differenceWith(cmp, swaggerResponses, apigwResponses);
    return responsesToAdd;
};
