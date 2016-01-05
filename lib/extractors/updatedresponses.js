"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.updatedResponses = undefined;

var _ramda = require("ramda");

var _ramda2 = _interopRequireDefault(_ramda);

var _util = require("../util");

var _responses = require("./apigw/responses");

var _responses2 = require("./swagger/responses");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var COMPARE_PROPS = ["path", "resourceMethod", "statusCode"];

var DIFF_PROPS = ["responseModels", "responseParameters"];

var updatedResponses = exports.updatedResponses = function updatedResponses(awsgwResourceData, swaggerSpec) {
    var apigwResponses = (0, _responses.extract)(awsgwResourceData);
    var swaggerResponses = (0, _responses2.extract)(swaggerSpec);
    var diffPred = function diffPred(a, b) {
        return _ramda2.default.equals(_ramda2.default.pick(DIFF_PROPS, a), _ramda2.default.pick(DIFF_PROPS, b));
    };
    var responsesToUpdate = (0, _util.updatedSetElements)((0, _util.cmpObjProps)(COMPARE_PROPS), diffPred, apigwResponses, swaggerResponses);
    return responsesToUpdate;
};
