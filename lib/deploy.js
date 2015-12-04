"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _this = this;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

var _bluebird = require("bluebird");

var _bluebird2 = _interopRequireDefault(_bluebird);

var _libApigateway = require("../lib/apigateway");

var _libApigateway2 = _interopRequireDefault(_libApigateway);

var _set = require("./set");

var _set2 = _interopRequireDefault(_set);

var _lambdazip = require("./lambdazip");

var _lambdazip2 = _interopRequireDefault(_lambdazip);

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _transpile = require("./transpile");

var _transpile2 = _interopRequireDefault(_transpile);

var _npminstall = require("./npminstall");

var _npminstall2 = _interopRequireDefault(_npminstall);

var _awsSdk = require("aws-sdk");

var _awsSdk2 = _interopRequireDefault(_awsSdk);

var _ramda = require("ramda");

var _ramda2 = _interopRequireDefault(_ramda);

var awaitable = _bluebird2["default"].promisify;
var lambda = new _awsSdk2["default"].Lambda();
var iam = new _awsSdk2["default"].IAM();
var createFunction = awaitable(lambda.createFunction.bind(lambda));
var addPermission = awaitable(lambda.addPermission.bind(lambda));
var listFunctions = awaitable(lambda.listFunctions.bind(lambda));
var getUser = awaitable(iam.getUser.bind(iam));
var updateFunctionCode = awaitable(lambda.updateFunctionCode.bind(lambda));
var updateFunctionConfiguration = awaitable(lambda.updateFunctionConfiguration.bind(lambda));

var mapSerialAsync = function mapSerialAsync(fn, list) {
    var result, tail, results;
    return regeneratorRuntime.async(function mapSerialAsync$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                if (!(!list || list.length === 0)) {
                    context$1$0.next = 2;
                    break;
                }

                return context$1$0.abrupt("return", []);

            case 2:
                context$1$0.next = 4;
                return regeneratorRuntime.awrap(fn(_ramda2["default"].head(list)));

            case 4:
                result = context$1$0.sent;
                tail = _ramda2["default"].tail(list);
                results = [];

                if (!(tail.length > 0)) {
                    context$1$0.next = 14;
                    break;
                }

                context$1$0.next = 10;
                return regeneratorRuntime.awrap(mapSerialAsync(fn, tail));

            case 10:
                results = context$1$0.sent;
                return context$1$0.abrupt("return", _ramda2["default"].concat([result], results));

            case 14:
                return context$1$0.abrupt("return", [result]);

            case 15:
            case "end":
                return context$1$0.stop();
        }
    }, null, _this);
};

var lambdaFunctionName = function lambdaFunctionName(apiSpec, methodSpec) {
    var basename = _ramda2["default"].compose(_ramda2["default"].replace(/\//g, "-"), _ramda2["default"].replace(/^\//, ""), _ramda2["default"].replace(/\}/, "_"), _ramda2["default"].replace(/\{/, "_"))(methodSpec.path);
    return apiSpec.apiName + "-" + apiSpec.env + "-" + apiSpec.stage + "-" + basename + "-" + methodSpec.method;
};

var extendSpec = _ramda2["default"].curry(function (path, spec, method) {
    var extSpec = _ramda2["default"].clone(spec);
    extSpec.path = path;
    extSpec.method = method;
    return extSpec;
});

var collapseSpec = function collapseSpec(methods, path) {
    return _ramda2["default"].values(_ramda2["default"].mapObjIndexed(extendSpec(path), methods));
};

var specPathsToEndpoints = _ramda2["default"].compose(_ramda2["default"].flatten, _ramda2["default"].values, _ramda2["default"].mapObjIndexed(collapseSpec));

var specPathsToResources = function specPathsToResources(spec) {
    return _ramda2["default"].keys(spec.paths);
};

var awsAccountId = function awsAccountId() {
    var user, accountId;
    return regeneratorRuntime.async(function awsAccountId$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                context$1$0.next = 2;
                return regeneratorRuntime.awrap(getUser({}));

            case 2:
                user = context$1$0.sent;
                accountId = user.User.Arn.split(":")[4];
                return context$1$0.abrupt("return", accountId);

            case 5:
            case "end":
                return context$1$0.stop();
        }
    }, null, _this);
};

var createApi = function createApi(logFn, region, name, desc) {
    var apis, api;
    return regeneratorRuntime.async(function createApi$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                context$1$0.next = 2;
                return regeneratorRuntime.awrap(_libApigateway2["default"].restapis(region));

            case 2:
                apis = context$1$0.sent;
                api = _ramda2["default"].find(_ramda2["default"].propEq("name", name), apis);

                if (api) {
                    context$1$0.next = 11;
                    break;
                }

                context$1$0.next = 7;
                return regeneratorRuntime.awrap(_libApigateway2["default"].createRestapi(region, name, desc));

            case 7:
                api = context$1$0.sent;

                logFn("ok", "created API '" + name + "'");
                context$1$0.next = 12;
                break;

            case 11:
                logFn("ok", "found existing API '" + name + "'");

            case 12:
                return context$1$0.abrupt("return", api);

            case 13:
            case "end":
                return context$1$0.stop();
        }
    }, null, _this);
};

var createResources = function createResources(region, api, spec) {
    var deployedResources, pathsToDeploy, deployedPaths, pathsToCreate, root, createPath;
    return regeneratorRuntime.async(function createResources$(context$1$0) {
        var _this2 = this;

        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                context$1$0.next = 2;
                return regeneratorRuntime.awrap(_libApigateway2["default"].resources(region, api.id));

            case 2:
                deployedResources = context$1$0.sent;
                pathsToDeploy = specPathsToResources(spec);
                deployedPaths = _ramda2["default"].map(_ramda2["default"].prop("path"), deployedResources);
                pathsToCreate = _set2["default"].difference(new Set(pathsToDeploy), new Set(deployedPaths));
                root = _ramda2["default"].find(_ramda2["default"].propEq("path", "/"), deployedResources);
                createPath = _ramda2["default"].curry(function callee$1$0(api, resources, parent, path) {
                    var currentPartFromPath, currentPart, currentPath, resource;
                    return regeneratorRuntime.async(function callee$1$0$(context$2$0) {
                        while (1) switch (context$2$0.prev = context$2$0.next) {
                            case 0:
                                if (!(parent.path === path)) {
                                    context$2$0.next = 2;
                                    break;
                                }

                                return context$2$0.abrupt("return");

                            case 2:
                                currentPartFromPath = _ramda2["default"].compose(_ramda2["default"].head, _ramda2["default"].split("/"), _ramda2["default"].replace(/^\//, ""), _ramda2["default"].replace(parent.path, ""));
                                currentPart = currentPartFromPath(path);
                                currentPath = _path2["default"].join(parent.path, currentPart);
                                resource = _ramda2["default"].find(_ramda2["default"].propEq("path", currentPath), resources);

                                if (!resource) {
                                    context$2$0.next = 11;
                                    break;
                                }

                                context$2$0.next = 9;
                                return regeneratorRuntime.awrap(createPath(api, resources, resource, path));

                            case 9:
                                context$2$0.next = 16;
                                break;

                            case 11:
                                context$2$0.next = 13;
                                return regeneratorRuntime.awrap(_libApigateway2["default"].createResource(region, api.id, parent.id, currentPart));

                            case 13:
                                resource = context$2$0.sent;
                                context$2$0.next = 16;
                                return regeneratorRuntime.awrap(createPath(api, resources, resource, path));

                            case 16:
                            case "end":
                                return context$2$0.stop();
                        }
                    }, null, _this2);
                });
                context$1$0.next = 10;
                return regeneratorRuntime.awrap(_bluebird2["default"].all(_ramda2["default"].map(createPath(api, deployedResources, root), _ramda2["default"].sort(_ramda2["default"].gt, [].concat(_toConsumableArray(pathsToCreate))))));

            case 10:
                return context$1$0.abrupt("return", context$1$0.sent);

            case 11:
            case "end":
                return context$1$0.stop();
        }
    }, null, _this);
};

var listAllFunctions = function listAllFunctions(region, nextMarker) {
    var params, data, moreFns;
    return regeneratorRuntime.async(function listAllFunctions$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                params = { MaxItems: 10000 };
                data = null;

                if (nextMarker) params.NextMarker = nextMarker;

                context$1$0.next = 5;
                return regeneratorRuntime.awrap(listFunctions(params));

            case 5:
                data = context$1$0.sent;

                if (!data.NextMarker) {
                    context$1$0.next = 13;
                    break;
                }

                context$1$0.next = 9;
                return regeneratorRuntime.awrap(listAllFunctions(region, data.NextMarker));

            case 9:
                moreFns = context$1$0.sent;
                return context$1$0.abrupt("return", _ramda2["default"].concat(data.Functions, moreFns));

            case 13:
                return context$1$0.abrupt("return", data.Functions);

            case 14:
            case "end":
                return context$1$0.stop();
        }
    }, null, _this);
};

var createOrUpdateFunction = function createOrUpdateFunction(existingFunctions, params) {
    var func, updateParams, codeParams;
    return regeneratorRuntime.async(function createOrUpdateFunction$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                func = _ramda2["default"].find(_ramda2["default"].propEq("FunctionName", params.FunctionName), existingFunctions);

                if (!func) {
                    context$1$0.next = 14;
                    break;
                }

                updateParams = _ramda2["default"].clone(params);
                codeParams = _ramda2["default"].pickAll(["FunctionName"], updateParams);

                codeParams = _ramda2["default"].merge(codeParams, updateParams.Code);
                Reflect.deleteProperty(updateParams, "Code");
                Reflect.deleteProperty(updateParams, "Runtime");
                context$1$0.next = 9;
                return regeneratorRuntime.awrap(updateFunctionCode(codeParams));

            case 9:
                context$1$0.next = 11;
                return regeneratorRuntime.awrap(updateFunctionConfiguration(updateParams));

            case 11:
                return context$1$0.abrupt("return", context$1$0.sent);

            case 14:
                context$1$0.next = 16;
                return regeneratorRuntime.awrap(createFunction(params));

            case 16:
                return context$1$0.abrupt("return", context$1$0.sent);

            case 17:
            case "end":
                return context$1$0.stop();
        }
    }, null, _this);
};

var installFunctionModules = _ramda2["default"].curry(function callee$0$0(dest, stage, spec) {
    return regeneratorRuntime.async(function callee$0$0$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                context$1$0.next = 2;
                return regeneratorRuntime.awrap((0, _npminstall2["default"])(dest + "/" + stage + spec.path + "/" + spec.method));

            case 2:
                return context$1$0.abrupt("return", context$1$0.sent);

            case 3:
            case "end":
                return context$1$0.stop();
        }
    }, null, _this);
});

var mapMethodParams = _ramda2["default"].curry(function (spec, endpointSpec, type) {
    var swaggerType = type === "querystring" ? "query" : type;
    var defaultParams = _ramda2["default"].path(["info", "x-aws-apigateway", "default-request-params", type], spec) || [];
    var endpointParams = _ramda2["default"].map(_ramda2["default"].prop("name"), _ramda2["default"].filter(_ramda2["default"].propEq("in", swaggerType), endpointSpec.parameters || []));
    var paramStrings = _ramda2["default"].map(function (param) {
        return "method.request." + type + "." + param;
    }, _ramda2["default"].concat(defaultParams, endpointParams));
    var buildHash = function buildHash(hash, param) {
        hash[param] = true;
        return hash;
    };
    return _ramda2["default"].reduce(buildHash, {}, paramStrings);
});

var methodRequestParams = function methodRequestParams(spec, endpointSpec) {
    var headers = mapMethodParams(spec, endpointSpec, "header");
    var querystring = mapMethodParams(spec, endpointSpec, "querystring");
    var paths = mapMethodParams(spec, endpointSpec, "path");
    return _extends({}, headers, querystring, paths);
};

var createOrUpdateMethod = _ramda2["default"].curry(function callee$0$0(region, apiId, resources, spec, endpointSpec) {
    var resource, params;
    return regeneratorRuntime.async(function callee$0$0$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                resource = _ramda2["default"].find(_ramda2["default"].propEq("path", endpointSpec.path), resources);
                params = methodRequestParams(spec, endpointSpec);
                context$1$0.prev = 2;
                context$1$0.next = 5;
                return regeneratorRuntime.awrap(_libApigateway2["default"].createMethod(region, apiId, resource.id, endpointSpec.method.toUpperCase(), params));

            case 5:
                return context$1$0.abrupt("return", context$1$0.sent);

            case 8:
                context$1$0.prev = 8;
                context$1$0.t0 = context$1$0["catch"](2);

                if (!(context$1$0.t0.message === "Method already exists for this resource")) {
                    context$1$0.next = 14;
                    break;
                }

                context$1$0.next = 13;
                return regeneratorRuntime.awrap(_libApigateway2["default"].updateMethod(region, apiId, resource.id, endpointSpec.method.toUpperCase(), params));

            case 13:
                return context$1$0.abrupt("return", context$1$0.sent);

            case 14:
            case "end":
                return context$1$0.stop();
        }
    }, null, _this, [[2, 8]]);
});

var createGatewayLambdaFunction = _ramda2["default"].curry(function callee$0$0(apiSpec, functionName, zip) {
    return regeneratorRuntime.async(function callee$0$0$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                context$1$0.next = 2;
                return regeneratorRuntime.awrap(createOrUpdateFunction(apiSpec.lambdaFunctions, {
                    Code: { ZipFile: zip },
                    FunctionName: functionName,
                    Handler: functionName + "." + apiSpec.defaultHandler,
                    Role: "arn:aws:iam::" + apiSpec.accountId + ":role/" + apiSpec.defaultRole,
                    Runtime: "nodejs"
                }));

            case 2:
                return context$1$0.abrupt("return", context$1$0.sent);

            case 3:
            case "end":
                return context$1$0.stop();
        }
    }, null, _this);
});

var addMethodPermission = _ramda2["default"].curry(function callee$0$0(apiSpec, methodSpec, functionName) {
    return regeneratorRuntime.async(function callee$0$0$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                context$1$0.next = 2;
                return regeneratorRuntime.awrap(addPermission({
                    Action: "lambda:InvokeFunction",
                    FunctionName: functionName,
                    Principal: "apigateway.amazonaws.com",
                    StatementId: functionName + "-" + new Date().getTime(),
                    SourceArn: "arn:aws:execute-api:" + apiSpec.region + ":" + apiSpec.accountId + ":" + apiSpec.api.id + "/*/" + methodSpec.method.toUpperCase() + methodSpec.path
                }));

            case 2:
                return context$1$0.abrupt("return", context$1$0.sent);

            case 3:
            case "end":
                return context$1$0.stop();
        }
    }, null, _this);
});

var createOrUpdateIntegration = _ramda2["default"].curry(function callee$0$0(apiSpec, methodSpec, resourceId, functionName) {
    var params, functionArn, paramNames, requestTemplates, opts;
    return regeneratorRuntime.async(function callee$0$0$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                params = methodRequestParams(apiSpec.spec, methodSpec);
                functionArn = "arn:aws:lambda:" + apiSpec.region + ":" + apiSpec.accountId + ":function:" + functionName;
                paramNames = _ramda2["default"].map(_ramda2["default"].compose(_ramda2["default"].last, _ramda2["default"].split(".")), _ramda2["default"].keys(params));
                requestTemplates = {};
                opts = {
                    resourceId: resourceId,
                    region: apiSpec.region,
                    apiId: apiSpec.api.id,
                    method: methodSpec.method.toUpperCase(),
                    credentials: apiSpec.defaultCredentials,
                    httpMethod: "POST",
                    type: "AWS",
                    uri: "arn:aws:apigateway:" + apiSpec.region + ":lambda:path/2015-03-31/functions/" + functionArn + "/invocations"
                };

                if (paramNames.length > 0) {
                    (function () {
                        var contentType = "application/json";
                        var templates = {};
                        _ramda2["default"].map(function (param) {
                            return templates[param] = "$input.params('" + param + "')";
                        }, paramNames);
                        requestTemplates[contentType] = JSON.stringify(templates);
                    })();
                }

                opts.requestTemplates = requestTemplates;

                context$1$0.prev = 7;
                context$1$0.next = 10;
                return regeneratorRuntime.awrap(_libApigateway2["default"].createIntegration(opts));

            case 10:
                return context$1$0.abrupt("return", context$1$0.sent);

            case 13:
                context$1$0.prev = 13;
                context$1$0.t0 = context$1$0["catch"](7);
                context$1$0.next = 17;
                return regeneratorRuntime.awrap(_libApigateway2["default"].updateIntegration(opts));

            case 17:
                return context$1$0.abrupt("return", context$1$0.sent);

            case 18:
            case "end":
                return context$1$0.stop();
        }
    }, null, _this, [[7, 13]]);
});

var createOrUpdateMethodResponses = _ramda2["default"].curry(function callee$0$0(apiSpec, methodSpec, resourceId) {
    var method, addCode, responses, createOrUpdate;
    return regeneratorRuntime.async(function callee$0$0$(context$1$0) {
        var _this3 = this;

        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                method = methodSpec.method.toUpperCase();

                addCode = function addCode(val, key) {
                    return _ramda2["default"].assoc("statusCode", key, val);
                };

                responses = _ramda2["default"].values(_ramda2["default"].mapObjIndexed(addCode, methodSpec.responses));
                createOrUpdate = _ramda2["default"].curry(function callee$1$0(apiSpec, method, resourceId, response) {
                    var headerParam, addParam, responseParameters;
                    return regeneratorRuntime.async(function callee$1$0$(context$2$0) {
                        while (1) switch (context$2$0.prev = context$2$0.next) {
                            case 0:
                                headerParam = function headerParam(header) {
                                    return "method.response.header." + header;
                                };

                                addParam = function addParam(params, header) {
                                    return _ramda2["default"].assoc(headerParam(header), true, params);
                                };

                                responseParameters = _ramda2["default"].reduce(addParam, {}, _ramda2["default"].keys(response.headers || {}));
                                context$2$0.prev = 3;
                                context$2$0.next = 6;
                                return regeneratorRuntime.awrap(_libApigateway2["default"].createMethodResponse(apiSpec.region, apiSpec.api.id, resourceId, method, response.statusCode, responseParameters));

                            case 6:
                                return context$2$0.abrupt("return", context$2$0.sent);

                            case 9:
                                context$2$0.prev = 9;
                                context$2$0.t0 = context$2$0["catch"](3);
                                context$2$0.next = 13;
                                return regeneratorRuntime.awrap(_libApigateway2["default"].updateMethodResponse(apiSpec.region, apiSpec.api.id, resourceId, method, response.statusCode, responseParameters));

                            case 13:
                                return context$2$0.abrupt("return", context$2$0.sent);

                            case 14:
                            case "end":
                                return context$2$0.stop();
                        }
                    }, null, _this3, [[3, 9]]);
                });
                context$1$0.next = 6;
                return regeneratorRuntime.awrap(mapSerialAsync(createOrUpdate(apiSpec, method, resourceId), responses));

            case 6:
                return context$1$0.abrupt("return", context$1$0.sent);

            case 7:
            case "end":
                return context$1$0.stop();
        }
    }, null, _this);
});

var createOrUpdateIntegrationResponses = _ramda2["default"].curry(function callee$0$0(apiSpec, methodSpec, resourceId) {
    var method, addCode, responses, propMatch, has200RespCode, createOrUpdate;
    return regeneratorRuntime.async(function callee$0$0$(context$1$0) {
        var _this4 = this;

        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                method = methodSpec.method.toUpperCase();

                addCode = function addCode(val, key) {
                    return _ramda2["default"].assoc("statusCode", key, val);
                };

                responses = _ramda2["default"].values(_ramda2["default"].mapObjIndexed(addCode, methodSpec.responses));

                propMatch = function propMatch(prop, regex) {
                    return _ramda2["default"].compose(_ramda2["default"].not, _ramda2["default"].isEmpty, _ramda2["default"].match(regex), _ramda2["default"].prop(prop));
                };

                has200RespCode = propMatch("statusCode", /2\d{2}/);

                if (!(_ramda2["default"].filter(has200RespCode, responses).length > 1)) {
                    context$1$0.next = 7;
                    break;
                }

                throw new Error("sorry, " + method + " " + methodSpec.path + " can't have more than one 2xx response");

            case 7:
                createOrUpdate = _ramda2["default"].curry(function callee$1$0(apiSpec, method, resourceId, response) {
                    var selectionPattern;
                    return regeneratorRuntime.async(function callee$1$0$(context$2$0) {
                        while (1) switch (context$2$0.prev = context$2$0.next) {
                            case 0:
                                selectionPattern = has200RespCode(response) ? null : response.statusCode;
                                context$2$0.prev = 1;
                                context$2$0.next = 4;
                                return regeneratorRuntime.awrap(_libApigateway2["default"].createIntegrationResponse(apiSpec.region, apiSpec.api.id, resourceId, method, response.statusCode, selectionPattern));

                            case 4:
                                return context$2$0.abrupt("return", context$2$0.sent);

                            case 7:
                                context$2$0.prev = 7;
                                context$2$0.t0 = context$2$0["catch"](1);

                            case 9:
                            case "end":
                                return context$2$0.stop();
                        }
                    }, null, _this4, [[1, 7]]);
                });
                context$1$0.next = 10;
                return regeneratorRuntime.awrap(mapSerialAsync(createOrUpdate(apiSpec, method, resourceId), responses));

            case 10:
                return context$1$0.abrupt("return", context$1$0.sent);

            case 11:
            case "end":
                return context$1$0.stop();
        }
    }, null, _this);
});

var zip = _ramda2["default"].curry(function callee$0$0(apiSpec, spec, functionName) {
    return regeneratorRuntime.async(function callee$0$0$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                context$1$0.next = 2;
                return regeneratorRuntime.awrap((0, _lambdazip2["default"])(apiSpec.dest + "/" + apiSpec.stage + spec.path + "/" + spec.method, functionName));

            case 2:
                return context$1$0.abrupt("return", context$1$0.sent);

            case 3:
            case "end":
                return context$1$0.stop();
        }
    }, null, _this);
});

var bindEndpointAndFunction = _ramda2["default"].curry(function callee$0$0(logFn, apiSpec, methodSpec) {
    var resourceId, functionName, createEndpoint, result;
    return regeneratorRuntime.async(function callee$0$0$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                resourceId = _ramda2["default"].prop("id", _ramda2["default"].find(_ramda2["default"].propEq("path", methodSpec.path), apiSpec.resources));
                functionName = lambdaFunctionName(apiSpec, methodSpec);
                createEndpoint = _ramda2["default"].composeP(function () {
                    return createOrUpdateIntegrationResponses(apiSpec, methodSpec, resourceId);
                }, function () {
                    return createOrUpdateMethodResponses(apiSpec, methodSpec, resourceId);
                }, function () {
                    return createOrUpdateIntegration(apiSpec, methodSpec, resourceId, functionName);
                }, function () {
                    return addMethodPermission(apiSpec, methodSpec, functionName);
                }, createGatewayLambdaFunction(apiSpec, functionName), zip(apiSpec, methodSpec));
                context$1$0.next = 5;
                return regeneratorRuntime.awrap(createEndpoint(functionName));

            case 5:
                result = context$1$0.sent;

                logFn("ok", "deployed " + methodSpec.method.toUpperCase() + " " + methodSpec.path);
                return context$1$0.abrupt("return", result);

            case 8:
            case "end":
                return context$1$0.stop();
        }
    }, null, _this);
});

var endpointModuleFilename = _ramda2["default"].curry(function (apiName, env, stage, dest, filename) {
    var relPath = filename.replace(dest + "/" + stage + "/", "");
    var parts = _ramda2["default"].init(relPath.split("/"));
    var dir = _path2["default"].dirname(relPath);
    var basename = apiName + "-" + env + "-" + stage + "-" + parts.join("-");
    var name = dest + "/" + stage + "/" + dir + "/" + basename.replace(/(\{|\})/g, "_") + ".js";
    return name;
});

var go = _ramda2["default"].curry(function callee$0$0(logFn, region, env, stage, dest, spec) {
    var accountId, api, lambdaFunctions, filenameFn, apiSpec;
    return regeneratorRuntime.async(function callee$0$0$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                context$1$0.prev = 0;
                context$1$0.next = 3;
                return regeneratorRuntime.awrap(awsAccountId());

            case 3:
                accountId = context$1$0.sent;
                context$1$0.next = 6;
                return regeneratorRuntime.awrap(createApi(logFn, region, spec.info.title + "-" + env, spec.info.title));

            case 6:
                api = context$1$0.sent;
                context$1$0.next = 9;
                return regeneratorRuntime.awrap(listAllFunctions(region));

            case 9:
                lambdaFunctions = context$1$0.sent;
                filenameFn = endpointModuleFilename(spec.info.title, env, stage, dest);
                apiSpec = {
                    region: region,
                    env: env,
                    stage: stage,
                    dest: dest,
                    spec: spec,
                    accountId: accountId,
                    api: api,
                    defaultCredentials: null,
                    defaultHandler: "handler",
                    defaultRole: spec.info["x-aws-apigateway"]["default-role"],
                    apiName: spec.info.title,
                    name: spec.info.title,
                    desc: spec.info.title,
                    endpoints: specPathsToEndpoints(spec.paths),
                    lambdaFunctions: lambdaFunctions
                };
                context$1$0.next = 14;
                return regeneratorRuntime.awrap((0, _transpile2["default"])("src/" + stage, dest + "/" + stage, filenameFn));

            case 14:
                logFn("ok", "transpiled");

                context$1$0.next = 17;
                return regeneratorRuntime.awrap(createResources(region, api, spec));

            case 17:
                logFn("ok", "created missing resources");

                context$1$0.next = 20;
                return regeneratorRuntime.awrap(_libApigateway2["default"].resources(region, api.id));

            case 20:
                apiSpec.resources = context$1$0.sent;

                logFn("ok", "fetched resources");

                // install NPMs for each endpoint lambda function
                context$1$0.next = 24;
                return regeneratorRuntime.awrap(mapSerialAsync(installFunctionModules(dest, stage), apiSpec.endpoints));

            case 24:
                logFn("ok", "installed lambda function NPM modules");

                // Make sure all gateway endpoints are created
                context$1$0.next = 27;
                return regeneratorRuntime.awrap(_bluebird2["default"].all(_ramda2["default"].map(createOrUpdateMethod(region, api.id, apiSpec.resources, spec), apiSpec.endpoints)));

            case 27:
                logFn("ok", "created method endpoints");

                // Create lambda functions and bind them to the api gateway endpoint methods
                context$1$0.next = 30;
                return regeneratorRuntime.awrap(_bluebird2["default"].all(_ramda2["default"].map(bindEndpointAndFunction(logFn, apiSpec), apiSpec.endpoints)));

            case 30:
                context$1$0.next = 32;
                return regeneratorRuntime.awrap(_libApigateway2["default"].deploy(region, api.id, stage));

            case 32:
                logFn("ok", "deployed api to https://" + api.id + ".execute-api." + region + ".amazonaws.com/" + stage);
                context$1$0.next = 39;
                break;

            case 35:
                context$1$0.prev = 35;
                context$1$0.t0 = context$1$0["catch"](0);

                logFn("error", context$1$0.t0);
                throw context$1$0.t0;

            case 39:
            case "end":
                return context$1$0.stop();
        }
    }, null, _this, [[0, 35]]);
});

exports["default"] = {
    createApi: createApi,
    createResources: createResources,
    listAllFunctions: listAllFunctions,
    go: go
};
module.exports = exports["default"];

// base case

// general case

// method already exists so try to update it

// *gulp*

// deploy the api