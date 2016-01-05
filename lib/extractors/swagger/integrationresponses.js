"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.extract = exports.extractIntegrationResponses = undefined;

var _ramda = require("ramda");

var _ramda2 = _interopRequireDefault(_ramda);

var _methods = require("./methods");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var PROPS = ["path", "resourceMethod", "statusCode", "selectionPattern"];

var expandResponses = _ramda2.default.curry(function (method) {
    var expand = _ramda2.default.curry(function (method, response, statusCode) {
        var oPath = ["x-aws-apigateway", "selectionPattern"];
        var selectionPatternOverride = _ramda2.default.path(oPath, response);
        var expanded = _ramda2.default.merge(method, {
            resourceMethod: method.httpMethod,
            statusCode: statusCode,
            responseDescription: response.description,
            selectionPattern: selectionPatternOverride ? selectionPatternOverride : statusCode === "200" ? null : statusCode
        });

        return expanded;
    });
    return _ramda2.default.values(_ramda2.default.mapObjIndexed(expand(method), method.responses));
});

var extractIntegrationResponses = exports.extractIntegrationResponses = _ramda2.default.compose(_ramda2.default.map(_ramda2.default.pick(PROPS)), _ramda2.default.flatten, _ramda2.default.values, _ramda2.default.mapObjIndexed(expandResponses), _ramda2.default.flatten, _ramda2.default.values, _ramda2.default.mapObjIndexed(_methods.collapseSpec), _ramda2.default.prop("paths"));

var extract = exports.extract = function extract(spec) {
    return extractIntegrationResponses(spec);
};
