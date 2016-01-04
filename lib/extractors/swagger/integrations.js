"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.extract = undefined;

var _ramda = require("ramda");

var _ramda2 = _interopRequireDefault(_ramda);

var _deepmerge = require("deepmerge");

var _deepmerge2 = _interopRequireDefault(_deepmerge);

var _methods = require("./methods");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var merge = _ramda2.default.curry(_deepmerge2.default);

var replaceKey = _ramda2.default.curry(function (origKey, newKey, obj) {
    var value = _ramda2.default.path([origKey], obj);
    var updated = _ramda2.default.assoc(newKey, value, obj);
    return _ramda2.default.dissoc(origKey, updated);
});

var defaults = function defaults(integration) {
    return _ramda2.default.merge(integration, {
        httpMethod: "POST",
        type: "AWS"
    });
};

var makeIntegration = _ramda2.default.compose(defaults, replaceKey("httpMethod", "resourceMethod"));

var extract = exports.extract = function extract(spec) {
    var methods = (0, _methods.extractMethods)(spec);
    var integrations = _ramda2.default.map(makeIntegration, methods);
    var defaultParams = {
        requestParameters: (0, _methods.paramsObj)((0, _methods.defReqParams)(spec))
    };
    integrations = _ramda2.default.map(merge(defaultParams), integrations);
    return _ramda2.default.map(function (integration) {
        return _ramda2.default.merge(integration, integration["x-aws-apigateway"]);
    }, integrations);
};
