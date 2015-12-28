"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _ramda = require("ramda");

var _ramda2 = _interopRequireDefault(_ramda);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var resourceProps = ["id", "parentId", "pathPart", "path"];

var methodProps = ["apiKeyRequired", "authorizationType", "httpMethod"];

var integrationProps = ["cacheKeyParameters", "cacheNamespace", "httpMethod", "requestTemplates", "type", "uri"];

var importParams = function importParams(params, param) {
    var parts = _ramda2.default.split(".", param);
    var type = parts[2];
    params[type] = _ramda2.default.append(parts[3], params[type] || []);
    return params;
};

var importIntegration = function importIntegration(method) {
    var integrationPath = ["_embedded", "method:integration"];
    var integration = _ramda2.default.pick(integrationProps, _ramda2.default.path(integrationPath, method) || {});

    var intRespParts = _ramda2.default.concat(integrationPath, ["_embedded", "integration:responses"]);
    var respKeys = ["statusCode", "selectionPattern", "responseTempates"];
    var responses = _ramda2.default.path(intRespParts, method);
    if (!_ramda2.default.is(Array, responses)) responses = [responses];
    var modifiedResponse = _ramda2.default.map(_ramda2.default.pick(respKeys), responses);
    integration.responses = modifiedResponse;

    return integration;
};

var importResponses = function importResponses(method) {
    var responsesPath = ["_embedded", "method:responses"];
    var responses = _ramda2.default.path(responsesPath, method);
    if (!_ramda2.default.is(Array, responses)) responses = [responses];
    return _ramda2.default.map(_ramda2.default.pick(["statusCode"]), responses);
};

var importMethods = function importMethods(methods, method) {
    var verb = method.httpMethod;
    methods[verb] = _ramda2.default.pick(methodProps, method);

    var paramKeys = _ramda2.default.keys(method.requestParameters || []);
    var params = _ramda2.default.reduce(importParams, {}, paramKeys);
    methods[verb].params = params;
    methods[verb].integration = importIntegration(method);
    methods[verb].responses = importResponses(method);

    return methods;
};

var importResources = function importResources(resources, resource) {
    var path = resource.path;
    resources[path] = _ramda2.default.pick(resourceProps, resource);

    var pathParts = ["_embedded", "resource:methods"];
    var methods = _ramda2.default.path(pathParts, resource) || [];
    if (!_ramda2.default.is(Array, methods)) methods = [methods];
    resources[resource.path].methods = _ramda2.default.reduce(importMethods, {}, methods);

    return resources;
};

exports.default = _ramda2.default.reduce(importResources, {});
module.exports = exports['default'];
