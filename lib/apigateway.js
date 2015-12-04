"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _this = this;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _ramda = require("ramda");

var _ramda2 = _interopRequireDefault(_ramda);

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _libAwsrequest = require("../lib/awsrequest");

var _libAwsrequest2 = _interopRequireDefault(_libAwsrequest);

var restapis = function restapis(region) {
    var reg, data, apis;
    return regeneratorRuntime.async(function restapis$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                reg = region || process.env.AWS_DEFAULT_REGION;
                context$1$0.next = 3;
                return regeneratorRuntime.awrap(_libAwsrequest2["default"].get({
                    host: "apigateway." + reg + ".amazonaws.com",
                    region: reg,
                    path: "/restapis"
                }));

            case 3:
                data = context$1$0.sent;

                if (data._embedded) {
                    context$1$0.next = 6;
                    break;
                }

                return context$1$0.abrupt("return", []);

            case 6:
                apis = data._embedded.item;
                // eslint-disable-line no-underscore-dangle
                // if there's only one API, then AWS returns an object, not an array
                if (!_ramda2["default"].is(Array, apis)) apis = [apis];
                return context$1$0.abrupt("return", apis);

            case 9:
            case "end":
                return context$1$0.stop();
        }
    }, null, _this);
};

var createRestapi = _ramda2["default"].curry(function callee$0$0(region, name, description) {
    return regeneratorRuntime.async(function callee$0$0$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                context$1$0.next = 2;
                return regeneratorRuntime.awrap(_libAwsrequest2["default"].post({
                    region: region,
                    host: "apigateway." + region + ".amazonaws.com",
                    path: "/restapis",
                    body: { name: name, description: description }
                }));

            case 2:
                return context$1$0.abrupt("return", context$1$0.sent);

            case 3:
            case "end":
                return context$1$0.stop();
        }
    }, null, _this);
});

var resources = _ramda2["default"].curry(function callee$0$0(region, apiId) {
    var res;
    return regeneratorRuntime.async(function callee$0$0$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                context$1$0.next = 2;
                return regeneratorRuntime.awrap(_libAwsrequest2["default"].get({
                    region: region,
                    host: "apigateway." + region + ".amazonaws.com",
                    path: "/restapis/" + apiId + "/resources"
                }));

            case 2:
                res = context$1$0.sent;

                res = res._embedded.item; // eslint-disable-line
                if (!_ramda2["default"].is(Array, res)) res = [res];
                return context$1$0.abrupt("return", res);

            case 6:
            case "end":
                return context$1$0.stop();
        }
    }, null, _this);
});

var createResource = function createResource(region, apiId, parentResourceId, pathPart) {
    var newResUrl;
    return regeneratorRuntime.async(function createResource$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                newResUrl = "/restapis/" + apiId + "/resources/" + parentResourceId;
                context$1$0.next = 3;
                return regeneratorRuntime.awrap(_libAwsrequest2["default"].post({
                    region: region,
                    host: "apigateway." + region + ".amazonaws.com",
                    path: newResUrl,
                    body: {
                        pathPart: pathPart,
                        name: pathPart.replace(/\{\}/, "")
                    }
                }));

            case 3:
                return context$1$0.abrupt("return", context$1$0.sent);

            case 4:
            case "end":
                return context$1$0.stop();
        }
    }, null, _this);
};

var method = function method(region, apiId, parentResourceId, _method) {
    return regeneratorRuntime.async(function method$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                context$1$0.next = 2;
                return regeneratorRuntime.awrap(_libAwsrequest2["default"].get({
                    region: region,
                    host: "apigateway." + region + ".amazonaws.com",
                    path: "/restapis/" + apiId + "/resources/" + parentResourceId + "/methods/" + _method.toUpperCase()
                }));

            case 2:
                return context$1$0.abrupt("return", context$1$0.sent);

            case 3:
            case "end":
                return context$1$0.stop();
        }
    }, null, _this);
};

var createMethod = function createMethod(region, apiId, parentResourceId, method) {
    var requestParams = arguments.length <= 4 || arguments[4] === undefined ? {} : arguments[4];
    var newMethUrl;
    return regeneratorRuntime.async(function createMethod$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                newMethUrl = "/restapis/" + apiId + "/resources/" + parentResourceId + "/methods/" + method.toUpperCase();
                context$1$0.next = 3;
                return regeneratorRuntime.awrap(_libAwsrequest2["default"].put({
                    region: region,
                    host: "apigateway." + region + ".amazonaws.com",
                    path: newMethUrl,
                    body: {
                        authorizationType: "NONE",
                        requestParameters: requestParams
                    }
                }));

            case 3:
                return context$1$0.abrupt("return", context$1$0.sent);

            case 4:
            case "end":
                return context$1$0.stop();
        }
    }, null, _this);
};

var updateMethod = function updateMethod(region, apiId, parentResourceId, method) {
    var requestParams = arguments.length <= 4 || arguments[4] === undefined ? {} : arguments[4];
    var methodUrl, patchOp;
    return regeneratorRuntime.async(function updateMethod$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                methodUrl = "/restapis/" + apiId + "/resources/" + parentResourceId + "/methods/" + method.toUpperCase();

                patchOp = function patchOp(param) {
                    return { op: "add", path: "/requestParameters/" + param };
                };

                context$1$0.next = 4;
                return regeneratorRuntime.awrap(_libAwsrequest2["default"].patch({
                    region: region,
                    host: "apigateway." + region + ".amazonaws.com",
                    path: methodUrl,
                    body: {
                        patchOperations: _ramda2["default"].map(patchOp, _ramda2["default"].keys(requestParams))
                    }
                }));

            case 4:
                return context$1$0.abrupt("return", context$1$0.sent);

            case 5:
            case "end":
                return context$1$0.stop();
        }
    }, null, _this);
};

var createIntegration = function createIntegration(opts) {
    var props;
    return regeneratorRuntime.async(function createIntegration$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                props = ["type", "httpMethod", "authorizationType", "uri", "credentials", "requestParameters", "requestTemplates", "cacheNamespace", "cacheKeyParameters"];
                context$1$0.next = 3;
                return regeneratorRuntime.awrap(_libAwsrequest2["default"].put({
                    region: opts.region,
                    host: "apigateway." + opts.region + ".amazonaws.com",
                    path: "/restapis/" + opts.apiId + "/resources/" + opts.resourceId + "/methods/" + opts.method.toUpperCase() + "/integration",
                    body: _ramda2["default"].pick(props, opts)
                }));

            case 3:
                return context$1$0.abrupt("return", context$1$0.sent);

            case 4:
            case "end":
                return context$1$0.stop();
        }
    }, null, _this);
};

var updateIntegration = function updateIntegration(opts) {
    var props, ops;
    return regeneratorRuntime.async(function updateIntegration$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                props = ["type", "httpMethod", "authorizationType", "uri", "credentials", "requestParameters", "requestTemplates", "cacheNamespace", "cacheKeyParameters"];
                ops = [{ op: "replace", path: "/httpMethod", value: opts.httpMethod }, { op: "replace", path: "/uri", value: opts.uri }, { op: "replace", path: "/credentials", value: opts.credentials }, { op: "replace", path: "/requestTemplates/application~1json", value: opts.requestTemplates }];
                context$1$0.next = 4;
                return regeneratorRuntime.awrap(_libAwsrequest2["default"].patch({
                    region: opts.region,
                    host: "apigateway." + opts.region + ".amazonaws.com",
                    path: "/restapis/" + opts.apiId + "/resources/" + opts.resourceId + "/methods/" + opts.method.toUpperCase() + "/integration",
                    body: { patchOperations: ops }
                }));

            case 4:
                return context$1$0.abrupt("return", context$1$0.sent);

            case 5:
            case "end":
                return context$1$0.stop();
        }
    }, null, _this);
};

var createMethodResponse = function createMethodResponse(region, apiId, resourceId, method, statusCode) {
    var responseParameters = arguments.length <= 5 || arguments[5] === undefined ? {} : arguments[5];
    var responseModels = arguments.length <= 6 || arguments[6] === undefined ? {} : arguments[6];
    return regeneratorRuntime.async(function createMethodResponse$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                context$1$0.next = 2;
                return regeneratorRuntime.awrap(_libAwsrequest2["default"].put({
                    region: region,
                    host: "apigateway." + region + ".amazonaws.com",
                    path: "/restapis/" + apiId + "/resources/" + resourceId + "/methods/" + method.toUpperCase() + "/responses/" + statusCode,
                    body: {
                        responseModels: responseModels,
                        responseParameters: responseParameters
                    }
                }));

            case 2:
                return context$1$0.abrupt("return", context$1$0.sent);

            case 3:
            case "end":
                return context$1$0.stop();
        }
    }, null, _this);
};

var updateMethodResponse = function updateMethodResponse(region, apiId, resourceId, method, statusCode) {
    var responseParameters = arguments.length <= 5 || arguments[5] === undefined ? {} : arguments[5];
    var responseModels = arguments.length <= 6 || arguments[6] === undefined ? {} : arguments[6];
    var genOp, ops;
    return regeneratorRuntime.async(function updateMethodResponse$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                genOp = function genOp(param) {
                    return {
                        op: "add",
                        path: "/responseParameters/" + param
                    };
                };

                ops = _ramda2["default"].map(genOp, _ramda2["default"].keys(responseParameters));
                context$1$0.next = 4;
                return regeneratorRuntime.awrap(_libAwsrequest2["default"].patch({
                    region: region,
                    host: "apigateway." + region + ".amazonaws.com",
                    path: "/restapis/" + apiId + "/resources/" + resourceId + "/methods/" + method.toUpperCase() + "/responses/" + statusCode,
                    body: {
                        patchOperations: ops
                    }
                }));

            case 4:
                return context$1$0.abrupt("return", context$1$0.sent);

            case 5:
            case "end":
                return context$1$0.stop();
        }
    }, null, _this);
};

var createIntegrationResponse = function createIntegrationResponse(region, apiId, resourceId, method, statusCode) {
    var selectionPattern = arguments.length <= 5 || arguments[5] === undefined ? null : arguments[5];
    return regeneratorRuntime.async(function createIntegrationResponse$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                context$1$0.next = 2;
                return regeneratorRuntime.awrap(_libAwsrequest2["default"].put({
                    region: region,
                    host: "apigateway." + region + ".amazonaws.com",
                    path: "/restapis/" + apiId + "/resources/" + resourceId + "/methods/" + method.toUpperCase() + "/integration/responses/" + statusCode,
                    body: {
                        selectionPattern: selectionPattern,
                        responseTemplates: { "application/json": null }
                    }
                }));

            case 2:
                return context$1$0.abrupt("return", context$1$0.sent);

            case 3:
            case "end":
                return context$1$0.stop();
        }
    }, null, _this);
};

var deployments = function deployments(region, apiId) {
    return regeneratorRuntime.async(function deployments$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                context$1$0.next = 2;
                return regeneratorRuntime.awrap(_libAwsrequest2["default"].get({
                    region: region,
                    host: "apigateway." + region + ".amazonaws.com",
                    path: "/restapis/" + apiId + "/deployments"
                }));

            case 2:
                return context$1$0.abrupt("return", context$1$0.sent);

            case 3:
            case "end":
                return context$1$0.stop();
        }
    }, null, _this);
};

var deploy = function deploy(region, apiId, stageName, stageDescription, description) {
    return regeneratorRuntime.async(function deploy$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                context$1$0.next = 2;
                return regeneratorRuntime.awrap(_libAwsrequest2["default"].post({
                    region: region,
                    host: "apigateway." + region + ".amazonaws.com",
                    path: "/restapis/" + apiId + "/deployments",
                    body: {
                        stageName: stageName,
                        stageDescription: stageDescription,
                        description: description
                    }
                }));

            case 2:
                return context$1$0.abrupt("return", context$1$0.sent);

            case 3:
            case "end":
                return context$1$0.stop();
        }
    }, null, _this);
};

var stages = function stages(region, apiId) {
    return regeneratorRuntime.async(function stages$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                context$1$0.next = 2;
                return regeneratorRuntime.awrap(_libAwsrequest2["default"].get({
                    region: region,
                    host: "apigateway." + region + ".amazonaws.com",
                    path: "/restapis/" + apiId + "/stages"
                }));

            case 2:
                return context$1$0.abrupt("return", context$1$0.sent);

            case 3:
            case "end":
                return context$1$0.stop();
        }
    }, null, _this);
};

exports["default"] = {
    restapis: restapis,
    createRestapi: createRestapi,
    resources: resources,
    createResource: createResource,
    method: method,
    createMethod: createMethod,
    updateMethod: updateMethod,
    createIntegration: createIntegration,
    createMethodResponse: createMethodResponse,
    updateMethodResponse: updateMethodResponse,
    createIntegrationResponse: createIntegrationResponse,
    deployments: deployments,
    deploy: deploy,
    stages: stages
};
module.exports = exports["default"];

// empty case - i.e. no APIs defined yet
// eslint-disable-line no-underscore-dangle