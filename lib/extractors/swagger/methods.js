"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.extract = exports.extractMethods = exports.paramsObj = exports.defReqParams = undefined;

var _ramda = require("ramda");

var _ramda2 = _interopRequireDefault(_ramda);

var _deepmerge = require("deepmerge");

var _deepmerge2 = _interopRequireDefault(_deepmerge);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var PROPS = ["path", "httpMethod", "authorizationType", "apiKeyRequired", "requestParameters", "x-aws-apigateway"];

var DEFAULTS = {
    authorizationType: "NONE",
    apiKeyRequired: false
};

var merge = _ramda2.default.curry(_deepmerge2.default);

// translate swagger param type to AWS param type
var awsType = function awsType(type) {
    return type === "query" ? "querystring" : type;
};
// translate a swagger param to an AWS param
var awsParams = function awsParams(params, type) {
    return _ramda2.default.map(function (param) {
        return "method.request." + awsType(type) + "." + param;
    }, params);
};

var defReqParams = exports.defReqParams = function defReqParams(spec) {
    var defParamsPath = ["info", "x-aws-apigateway", "default-request-params"];
    var defParams = _ramda2.default.pathOr({}, defParamsPath, spec);
    var awsDefParams = _ramda2.default.mapObjIndexed(awsParams, defParams);
    return _ramda2.default.flatten(_ramda2.default.values(awsDefParams));
};

var paramsObj = exports.paramsObj = function paramsObj(params) {
    var vals = _ramda2.default.map(function () {
        return true;
    }, _ramda2.default.range(0, _ramda2.default.length(params)));
    return _ramda2.default.zipObj(params, vals);
};

var extractParams = function extractParams(spec) {
    var params = spec.parameters || [];
    var queryparams = awsParams(_ramda2.default.map(_ramda2.default.prop("name"), _ramda2.default.filter(_ramda2.default.propEq("in", "query"), params)), "query");
    var pathparams = awsParams(_ramda2.default.map(_ramda2.default.prop("name"), _ramda2.default.filter(_ramda2.default.propEq("in", "path"), params)), "path");
    var headers = awsParams(_ramda2.default.map(_ramda2.default.prop("name"), _ramda2.default.filter(_ramda2.default.propEq("in", "header"), params)), "header");
    params = _ramda2.default.concat(_ramda2.default.concat(queryparams, pathparams), headers);
    return paramsObj(params);
};

var extendSpec = _ramda2.default.curry(function (path, spec, method) {
    var extSpec = _ramda2.default.clone(spec);
    extSpec.path = path;
    extSpec.httpMethod = _ramda2.default.toUpper(method);
    extSpec.requestParameters = extractParams(spec);
    return extSpec;
});

var collapseSpec = function collapseSpec(methods, path) {
    return _ramda2.default.values(_ramda2.default.mapObjIndexed(extendSpec(path), methods));
};

var extractMethods = exports.extractMethods = _ramda2.default.compose(_ramda2.default.map(_ramda2.default.merge(DEFAULTS)), _ramda2.default.map(_ramda2.default.pick(PROPS)), _ramda2.default.flatten, _ramda2.default.values, _ramda2.default.mapObjIndexed(collapseSpec), _ramda2.default.prop("paths"));

var extract = exports.extract = function extract(spec) {
    var methods = extractMethods(spec);
    var defaultParams = {
        requestParameters: paramsObj(defReqParams(spec))
    };
    methods = _ramda2.default.map(merge(defaultParams), methods);
    return _ramda2.default.map(function (method) {
        return _ramda2.default.merge(method, method["x-aws-apigateway"]);
    }, methods);
};
