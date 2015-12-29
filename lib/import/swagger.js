"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _ramda = require("ramda");

var _ramda2 = _interopRequireDefault(_ramda);

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _util = require("../../lib/util");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var reducer = _ramda2.default.curry(function (spec, resources, path) {
    if (!resources[path]) resources[path] = {};
    var resource = resources[path];

    resource.path = path;
    resource.pathPart = _path2.default.basename(path);
    resource.methods = (0, _util.mapKeys)(_ramda2.default.toUpper, spec.paths[path]);
    resource.methods = _ramda2.default.mapObjIndexed(function (method, httpMethod) {
        var authType = _ramda2.default.path(["x-aws-apigateway", "authorizationType"]);
        var apiKeyReq = _ramda2.default.path(["x-aws-apigateway", "apiKeyRequired"]);
        var integrationMethod = _ramda2.default.path(["x-aws-apigateway", "integrationHttpMethod"]);
        var integrationType = _ramda2.default.path(["x-aws-apigateway", "integrationType"]);

        method.httpMethod = httpMethod;
        method.authorizationType = authType(method) || "NONE";
        method.apiKeyRequired = apiKeyReq(method) || false;

        method.params = _ramda2.default.reduce(function (params, param) {
            var type = param.in === "query" ? "querystring" : param.in;
            params[type] = _ramda2.default.append(param.name, _ramda2.default.or(params[type], []));
            return params;
        }, {}, _ramda2.default.or(method.parameters, []));

        method.integration = {
            // default is lambda, which is a POST
            httpMethod: integrationMethod(method) || "POST",
            type: integrationType(method) || "AWS",
            requestTemplates: {
                "application/json": "{" + _ramda2.default.join(",", _ramda2.default.reduce(function (arr, param) {
                    return _ramda2.default.append("\"" + param + "\":\"$input.params('" + param + "')\"", arr);
                }, [], _ramda2.default.flatten(_ramda2.default.values(method.params)))) + "\"body\":$input.json('$')}"
            },
            responses: _ramda2.default.reduce(function (responses, statusCode) {
                return _ramda2.default.append({
                    statusCode: statusCode,
                    responseTemplates: { "application/json": null },
                    selectionPattern: statusCode === "200" ? null : statusCode
                }, responses);
            }, [], _ramda2.default.keys(method.responses))
        };

        method.responses = _ramda2.default.reduce(function (responses, statusCode) {
            return _ramda2.default.append({ statusCode: statusCode }, responses);
        }, [], _ramda2.default.keys(method.responses));

        return method;
    }, resource.methods);

    var methodProps = ["apiKeyRequired", "authorizationType", "httpMethod", "params", "integration", "responses"];
    resource.methods = _ramda2.default.map(_ramda2.default.pick(methodProps), resource.methods);

    return resources;
});

exports.default = function (swaggerSpec) {
    var reduced = _ramda2.default.reduce(reducer(swaggerSpec), {}, _ramda2.default.keys(swaggerSpec.paths));

    // fill in resource path parts
    var fillIn = _ramda2.default.curry(function (reduced, resources, path) {
        var pathParts = _ramda2.default.tail(_ramda2.default.split("/", path));
        var fillInResource = _ramda2.default.curry(function (resources, parts, pathPart) {
            var currentParts = _ramda2.default.append(pathPart, parts);
            var path = "/" + _ramda2.default.join("/", currentParts);
            var exists = (0, _util.notNil)(reduced[path]);
            resources[path] = exists ? reduced[path] : {
                path: path,
                pathPart: _path2.default.basename(path)
            };
            return currentParts;
        });
        _ramda2.default.reduce(fillInResource(resources), [], pathParts);

        return resources;
    });

    return _ramda2.default.reduce(fillIn(reduced), {}, _ramda2.default.keys(reduced));
};

module.exports = exports['default'];
