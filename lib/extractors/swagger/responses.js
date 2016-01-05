"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.extract = exports.extractResponses = undefined;

var _ramda = require("ramda");

var _ramda2 = _interopRequireDefault(_ramda);

var _methods = require("./methods");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var PROPS = ["path", "resourceMethod", "statusCode", "responseModels", "responseParameters"];

var expandResponses = _ramda2.default.curry(function (method) {
    var expand = _ramda2.default.curry(function (method, response, statusCode) {
        var modelsOverride = _ramda2.default.pathOr({}, ["x-aws-apigateway", "responseModels"], response);
        var paramsOverride = _ramda2.default.pathOr({}, ["x-aws-apigateway", "responseParameters"], response);
        var expanded = _ramda2.default.merge(method, {
            resourceMethod: method.httpMethod,
            statusCode: statusCode,
            responseModels: modelsOverride,
            responseParameters: paramsOverride
        });

        return expanded;
    });
    return _ramda2.default.values(_ramda2.default.mapObjIndexed(expand(method), method.responses));
});

var extractResponses = exports.extractResponses = _ramda2.default.compose(_ramda2.default.map(_ramda2.default.pick(PROPS)), _ramda2.default.flatten, _ramda2.default.values, _ramda2.default.mapObjIndexed(expandResponses), _ramda2.default.flatten, _ramda2.default.values, _ramda2.default.mapObjIndexed(_methods.collapseSpec), _ramda2.default.prop("paths"));

var extract = exports.extract = function extract(spec) {
    return extractResponses(spec);
};
