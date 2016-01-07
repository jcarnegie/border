"use strict";

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _bluebird = require("bluebird");

var _bluebird2 = _interopRequireDefault(_bluebird);

var _apigateway = require("../lib/apigateway");

var _apigateway2 = _interopRequireDefault(_apigateway);

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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new _bluebird2.default(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { _bluebird2.default.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } step("next"); }); }; }

var awaitable = _bluebird2.default.promisify;
var lambda = new _awsSdk2.default.Lambda();
var iam = new _awsSdk2.default.IAM();
var createFunction = awaitable(lambda.createFunction.bind(lambda));
var addPermission = awaitable(lambda.addPermission.bind(lambda));
var listFunctions = awaitable(lambda.listFunctions.bind(lambda));
var getUser = awaitable(iam.getUser.bind(iam));
var updateFunctionCode = awaitable(lambda.updateFunctionCode.bind(lambda));
var updateFunctionConfiguration = awaitable(lambda.updateFunctionConfiguration.bind(lambda));

var mapSerialAsync = (function () {
    var _this = this;

    var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(fn, list) {
        var result, tail, results;
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        if (!(!list || list.length === 0)) {
                            _context.next = 2;
                            break;
                        }

                        return _context.abrupt("return", []);

                    case 2:
                        _context.next = 4;
                        return fn(_ramda2.default.head(list));

                    case 4:
                        result = _context.sent;
                        tail = _ramda2.default.tail(list);
                        results = [];

                        if (!(tail.length > 0)) {
                            _context.next = 14;
                            break;
                        }

                        _context.next = 10;
                        return mapSerialAsync(fn, tail);

                    case 10:
                        results = _context.sent;
                        return _context.abrupt("return", _ramda2.default.concat([result], results));

                    case 14:
                        return _context.abrupt("return", [result]);

                    case 15:
                    case "end":
                        return _context.stop();
                }
            }
        }, _callee, _this);
    }));

    return function mapSerialAsync(_x, _x2) {
        return ref.apply(this, arguments);
    };
})();

var lambdaFunctionName = function lambdaFunctionName(apiSpec, methodSpec) {
    var basename = _ramda2.default.compose(_ramda2.default.replace(/\//g, "-"), _ramda2.default.replace(/^\//, ""), _ramda2.default.replace(/\}/, "_"), _ramda2.default.replace(/\{/, "_"))(methodSpec.path);
    return apiSpec.apiName + "-" + apiSpec.env + "-" + apiSpec.stage + "-" + basename + "-" + methodSpec.method;
};

var extendSpec = _ramda2.default.curry(function (path, spec, method) {
    var extSpec = _ramda2.default.clone(spec);
    extSpec.path = path;
    extSpec.method = method;
    return extSpec;
});

var collapseSpec = function collapseSpec(methods, path) {
    return _ramda2.default.values(_ramda2.default.mapObjIndexed(extendSpec(path), methods));
};

var specPathsToEndpoints = _ramda2.default.compose(_ramda2.default.flatten, _ramda2.default.values, _ramda2.default.mapObjIndexed(collapseSpec));

var specPathsToResources = function specPathsToResources(spec) {
    return _ramda2.default.keys(spec.paths);
};

var awsAccountId = (function () {
    var _this2 = this;

    var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee2() {
        var user, accountId;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        _context2.next = 2;
                        return getUser({});

                    case 2:
                        user = _context2.sent;
                        accountId = user.User.Arn.split(":")[4];
                        return _context2.abrupt("return", accountId);

                    case 5:
                    case "end":
                        return _context2.stop();
                }
            }
        }, _callee2, _this2);
    }));

    return function awsAccountId() {
        return ref.apply(this, arguments);
    };
})();

var createApi = (function () {
    var _this3 = this;

    var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(logFn, region, name, desc) {
        var apis, api;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        _context3.next = 2;
                        return _apigateway2.default.restapis(region);

                    case 2:
                        apis = _context3.sent;
                        api = _ramda2.default.find(_ramda2.default.propEq("name", name), apis);

                        if (!api) {
                            _context3.next = 8;
                            break;
                        }

                        logFn("ok", "found existing API '" + name + "'");
                        _context3.next = 12;
                        break;

                    case 8:
                        _context3.next = 10;
                        return _apigateway2.default.createRestapi(region, name, desc);

                    case 10:
                        api = _context3.sent;

                        logFn("ok", "created API '" + name + "'");

                    case 12:
                        return _context3.abrupt("return", api);

                    case 13:
                    case "end":
                        return _context3.stop();
                }
            }
        }, _callee3, _this3);
    }));

    return function createApi(_x3, _x4, _x5, _x6) {
        return ref.apply(this, arguments);
    };
})();

var createResources = (function () {
    var _this5 = this;

    var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee5(region, api, spec) {
        var deployedResources, pathsToDeploy, deployedPaths, pathsToCreate, root, createPath, sortedPaths;
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
            while (1) {
                switch (_context5.prev = _context5.next) {
                    case 0:
                        _context5.next = 2;
                        return _apigateway2.default.resources(region, api.id);

                    case 2:
                        deployedResources = _context5.sent;
                        pathsToDeploy = specPathsToResources(spec);
                        deployedPaths = _ramda2.default.map(_ramda2.default.prop("path"), deployedResources);
                        pathsToCreate = _set2.default.difference(new Set(pathsToDeploy), new Set(deployedPaths));
                        root = _ramda2.default.find(_ramda2.default.propEq("path", "/"), deployedResources);
                        createPath = _ramda2.default.curry((function () {
                            var _this4 = this;

                            var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee4(api, resources, parent, path) {
                                var currentPartFromPath, currentPart, currentPath, resource;
                                return regeneratorRuntime.wrap(function _callee4$(_context4) {
                                    while (1) {
                                        switch (_context4.prev = _context4.next) {
                                            case 0:
                                                if (!(parent.path === path)) {
                                                    _context4.next = 2;
                                                    break;
                                                }

                                                return _context4.abrupt("return");

                                            case 2:

                                                // general case
                                                currentPartFromPath = _ramda2.default.compose(_ramda2.default.head, _ramda2.default.split("/"), _ramda2.default.replace(/^\//, ""), _ramda2.default.replace(parent.path, ""));
                                                currentPart = currentPartFromPath(path);
                                                currentPath = _path2.default.join(parent.path, currentPart);
                                                resource = _ramda2.default.find(_ramda2.default.propEq("path", currentPath), resources);

                                                if (!resource) {
                                                    _context4.next = 11;
                                                    break;
                                                }

                                                _context4.next = 9;
                                                return createPath(api, resources, resource, path);

                                            case 9:
                                                _context4.next = 16;
                                                break;

                                            case 11:
                                                _context4.next = 13;
                                                return _apigateway2.default.createResource(region, api.id, parent.id, currentPart);

                                            case 13:
                                                resource = _context4.sent;
                                                _context4.next = 16;
                                                return createPath(api, resources, resource, path);

                                            case 16:
                                            case "end":
                                                return _context4.stop();
                                        }
                                    }
                                }, _callee4, _this4);
                            }));

                            return function (_x10, _x11, _x12, _x13) {
                                return ref.apply(this, arguments);
                            };
                        })());
                        sortedPaths = _ramda2.default.sort(_ramda2.default.gt, [].concat(_toConsumableArray(pathsToCreate)));
                        _context5.next = 11;
                        return _bluebird2.default.all(_ramda2.default.map(createPath(api, deployedResources, root), sortedPaths));

                    case 11:
                        return _context5.abrupt("return", _context5.sent);

                    case 12:
                    case "end":
                        return _context5.stop();
                }
            }
        }, _callee5, _this5);
    }));

    return function createResources(_x7, _x8, _x9) {
        return ref.apply(this, arguments);
    };
})();

var listAllFunctions = (function () {
    var _this6 = this;

    var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee6(region, nextMarker) {
        var params, data, moreFns;
        return regeneratorRuntime.wrap(function _callee6$(_context6) {
            while (1) {
                switch (_context6.prev = _context6.next) {
                    case 0:
                        params = { MaxItems: 10000 };
                        data = null;

                        if (nextMarker) params.NextMarker = nextMarker;

                        _context6.next = 5;
                        return listFunctions(params);

                    case 5:
                        data = _context6.sent;

                        if (!data.NextMarker) {
                            _context6.next = 13;
                            break;
                        }

                        _context6.next = 9;
                        return listAllFunctions(region, data.NextMarker);

                    case 9:
                        moreFns = _context6.sent;
                        return _context6.abrupt("return", _ramda2.default.concat(data.Functions, moreFns));

                    case 13:
                        return _context6.abrupt("return", data.Functions);

                    case 14:
                    case "end":
                        return _context6.stop();
                }
            }
        }, _callee6, _this6);
    }));

    return function listAllFunctions(_x14, _x15) {
        return ref.apply(this, arguments);
    };
})();

var createOrUpdateFunction = (function () {
    var _this7 = this;

    var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee7(logFn, existingFunctions, params) {
        var func, updateParams, codeParams, res;
        return regeneratorRuntime.wrap(function _callee7$(_context7) {
            while (1) {
                switch (_context7.prev = _context7.next) {
                    case 0:
                        func = _ramda2.default.find(_ramda2.default.propEq("FunctionName", params.FunctionName), existingFunctions);

                        if (!func) {
                            _context7.next = 17;
                            break;
                        }

                        updateParams = _ramda2.default.clone(params);
                        codeParams = _ramda2.default.pickAll(["FunctionName"], updateParams);

                        codeParams = _ramda2.default.merge(codeParams, updateParams.Code);
                        Reflect.deleteProperty(updateParams, "Code");
                        Reflect.deleteProperty(updateParams, "Runtime");
                        _context7.next = 9;
                        return updateFunctionCode(codeParams);

                    case 9:
                        logFn("info", "updated function code");
                        _context7.next = 12;
                        return updateFunctionConfiguration(updateParams);

                    case 12:
                        res = _context7.sent;

                        logFn("info", "updated function configuration");
                        return _context7.abrupt("return", res);

                    case 17:
                        _context7.next = 19;
                        return createFunction(params);

                    case 19:
                        res = _context7.sent;

                        logFn("info", "created integration");
                        return _context7.abrupt("return", res);

                    case 22:
                    case "end":
                        return _context7.stop();
                }
            }
        }, _callee7, _this7);
    }));

    return function createOrUpdateFunction(_x16, _x17, _x18) {
        return ref.apply(this, arguments);
    };
})();

var installFunctionModules = _ramda2.default.curry((function () {
    var _this8 = this;

    var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee8(dest, stage, spec) {
        return regeneratorRuntime.wrap(function _callee8$(_context8) {
            while (1) {
                switch (_context8.prev = _context8.next) {
                    case 0:
                        _context8.next = 2;
                        return (0, _npminstall2.default)(dest + "/" + stage + spec.path + "/" + spec.method);

                    case 2:
                        return _context8.abrupt("return", _context8.sent);

                    case 3:
                    case "end":
                        return _context8.stop();
                }
            }
        }, _callee8, _this8);
    }));

    return function (_x19, _x20, _x21) {
        return ref.apply(this, arguments);
    };
})());

var mapMethodParams = _ramda2.default.curry(function (spec, endpointSpec, type) {
    var swaggerType = type === "querystring" ? "query" : type;
    var defaultParams = _ramda2.default.path(["info", "x-aws-apigateway", "default-request-params", type], spec) || [];
    var endpointParams = _ramda2.default.map(_ramda2.default.prop("name"), _ramda2.default.filter(_ramda2.default.propEq("in", swaggerType), endpointSpec.parameters || []));
    var paramStrings = _ramda2.default.map(function (param) {
        return "method.request." + type + "." + param;
    }, _ramda2.default.concat(defaultParams, endpointParams));
    var buildHash = function buildHash(hash, param) {
        hash[param] = true;
        return hash;
    };
    return _ramda2.default.reduce(buildHash, {}, paramStrings);
});

var methodRequestParams = function methodRequestParams(spec, endpointSpec) {
    var headers = mapMethodParams(spec, endpointSpec, "header");
    var querystring = mapMethodParams(spec, endpointSpec, "querystring");
    var paths = mapMethodParams(spec, endpointSpec, "path");
    return _extends({}, headers, querystring, paths);
};

var createOrUpdateMethod = _ramda2.default.curry((function () {
    var _this9 = this;

    var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee9(region, apiId, resources, spec, endpointSpec) {
        var resource, params;
        return regeneratorRuntime.wrap(function _callee9$(_context9) {
            while (1) {
                switch (_context9.prev = _context9.next) {
                    case 0:
                        resource = _ramda2.default.find(_ramda2.default.propEq("path", endpointSpec.path), resources);
                        params = methodRequestParams(spec, endpointSpec);
                        _context9.prev = 2;
                        _context9.next = 5;
                        return _apigateway2.default.createMethod(region, apiId, resource.id, endpointSpec.method.toUpperCase(), params);

                    case 5:
                        return _context9.abrupt("return", _context9.sent);

                    case 8:
                        _context9.prev = 8;
                        _context9.t0 = _context9["catch"](2);

                        if (!(_context9.t0.message === "Method already exists for this resource")) {
                            _context9.next = 14;
                            break;
                        }

                        _context9.next = 13;
                        return _apigateway2.default.updateMethod(region, apiId, resource.id, endpointSpec.method.toUpperCase(), params);

                    case 13:
                        return _context9.abrupt("return", _context9.sent);

                    case 14:
                    case "end":
                        return _context9.stop();
                }
            }
        }, _callee9, _this9, [[2, 8]]);
    }));

    return function (_x22, _x23, _x24, _x25, _x26) {
        return ref.apply(this, arguments);
    };
})());

var createGatewayLambdaFunction = _ramda2.default.curry((function () {
    var _this10 = this;

    var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee10(logFn, apiSpec, functionName, zip) {
        return regeneratorRuntime.wrap(function _callee10$(_context10) {
            while (1) {
                switch (_context10.prev = _context10.next) {
                    case 0:
                        _context10.next = 2;
                        return createOrUpdateFunction(logFn, apiSpec.lambdaFunctions, {
                            Code: { ZipFile: zip },
                            FunctionName: functionName,
                            // Handler: `${functionName}.${apiSpec.defaultHandler}`,
                            Handler: "index." + apiSpec.defaultHandler,
                            Role: "arn:aws:iam::" + apiSpec.accountId + ":role/" + apiSpec.defaultRole,
                            Runtime: "nodejs"
                        });

                    case 2:
                        return _context10.abrupt("return", _context10.sent);

                    case 3:
                    case "end":
                        return _context10.stop();
                }
            }
        }, _callee10, _this10);
    }));

    return function (_x27, _x28, _x29, _x30) {
        return ref.apply(this, arguments);
    };
})());

var addMethodPermission = _ramda2.default.curry((function () {
    var _this11 = this;

    var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee11(logFn, apiSpec, methodSpec, functionName) {
        var res;
        return regeneratorRuntime.wrap(function _callee11$(_context11) {
            while (1) {
                switch (_context11.prev = _context11.next) {
                    case 0:
                        _context11.next = 2;
                        return addPermission({
                            Action: "lambda:InvokeFunction",
                            FunctionName: functionName,
                            Principal: "apigateway.amazonaws.com",
                            StatementId: functionName + "-" + new Date().getTime(),
                            SourceArn: "arn:aws:execute-api:" + apiSpec.region + ":" + apiSpec.accountId + ":" + apiSpec.api.id + "/*/" + methodSpec.method.toUpperCase() + methodSpec.path
                        });

                    case 2:
                        res = _context11.sent;

                        logFn("info", "added method permission " + methodSpec.method.toUpperCase() + " " + methodSpec.path);

                        return _context11.abrupt("return", res);

                    case 5:
                    case "end":
                        return _context11.stop();
                }
            }
        }, _callee11, _this11);
    }));

    return function (_x31, _x32, _x33, _x34) {
        return ref.apply(this, arguments);
    };
})());

var createOrUpdateIntegration = _ramda2.default.curry((function () {
    var _this12 = this;

    var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee12(logFn, apiSpec, methodSpec, resourceId, functionName) {
        var params, functionArn, paramNames, requestTemplates, opts, _res, _res2;

        return regeneratorRuntime.wrap(function _callee12$(_context12) {
            while (1) {
                switch (_context12.prev = _context12.next) {
                    case 0:
                        params = methodRequestParams(apiSpec.spec, methodSpec);
                        functionArn = "arn:aws:lambda:" + apiSpec.region + ":" + apiSpec.accountId + ":function:" + functionName;
                        paramNames = _ramda2.default.map(_ramda2.default.compose(_ramda2.default.last, _ramda2.default.split(".")), _ramda2.default.keys(params));
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
                                _ramda2.default.map(function (param) {
                                    return templates[param] = "$input.params('" + param + "')";
                                }, paramNames);
                                templates.body = "$input.json('$')";
                                var templateStr = JSON.stringify(templates);
                                var match = "\"$input.json('$')\"";
                                var replacement = "$input.json('$$')";
                                requestTemplates[contentType] = templateStr.replace(match, replacement);
                            })();
                        }

                        opts.requestTemplates = requestTemplates;

                        _context12.prev = 7;
                        _context12.next = 10;
                        return _apigateway2.default.createIntegration(opts);

                    case 10:
                        _res = _context12.sent;

                        logFn("info", "created integration " + methodSpec.method.toUpperCase() + " " + methodSpec.path);
                        return _context12.abrupt("return", _res);

                    case 15:
                        _context12.prev = 15;
                        _context12.t0 = _context12["catch"](7);
                        _context12.next = 19;
                        return _apigateway2.default.updateIntegration(opts);

                    case 19:
                        _res2 = _context12.sent;

                        logFn("info", "updated integration " + methodSpec.method.toUpperCase() + " " + methodSpec.path);
                        return _context12.abrupt("return", _res2);

                    case 22:
                    case "end":
                        return _context12.stop();
                }
            }
        }, _callee12, _this12, [[7, 15]]);
    }));

    return function (_x35, _x36, _x37, _x38, _x39) {
        return ref.apply(this, arguments);
    };
})());

var createOrUpdateMethodResponses = _ramda2.default.curry((function () {
    var _this14 = this;

    var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee14(logFn, apiSpec, methodSpec, resourceId) {
        var method, addCode, responses, createOrUpdate;
        return regeneratorRuntime.wrap(function _callee14$(_context14) {
            while (1) {
                switch (_context14.prev = _context14.next) {
                    case 0:
                        method = methodSpec.method.toUpperCase();

                        addCode = function addCode(val, key) {
                            return _ramda2.default.assoc("statusCode", key, val);
                        };

                        responses = _ramda2.default.values(_ramda2.default.mapObjIndexed(addCode, methodSpec.responses));
                        createOrUpdate = _ramda2.default.curry((function () {
                            var _this13 = this;

                            var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee13(apiSpec, method, resourceId, response) {
                                var headerParam, addParam, responseParameters, _res3, _res4;

                                return regeneratorRuntime.wrap(function _callee13$(_context13) {
                                    while (1) {
                                        switch (_context13.prev = _context13.next) {
                                            case 0:
                                                headerParam = function headerParam(header) {
                                                    return "method.response.header." + header;
                                                };

                                                addParam = function addParam(params, header) {
                                                    return _ramda2.default.assoc(headerParam(header), true, params);
                                                };

                                                responseParameters = _ramda2.default.reduce(addParam, {}, _ramda2.default.keys(response.headers || {}));
                                                _context13.prev = 3;
                                                _context13.next = 6;
                                                return _apigateway2.default.createMethodResponse(apiSpec.region, apiSpec.api.id, resourceId, method, response.statusCode, responseParameters);

                                            case 6:
                                                _res3 = _context13.sent;

                                                logFn("info", "created method response " + methodSpec.method.toUpperCase() + " " + methodSpec.path);
                                                return _context13.abrupt("return", _res3);

                                            case 11:
                                                _context13.prev = 11;
                                                _context13.t0 = _context13["catch"](3);
                                                _context13.next = 15;
                                                return _apigateway2.default.updateMethodResponse(apiSpec.region, apiSpec.api.id, resourceId, method, response.statusCode, responseParameters);

                                            case 15:
                                                _res4 = _context13.sent;

                                                logFn("info", "updated method response " + methodSpec.method.toUpperCase() + " " + methodSpec.path);
                                                return _context13.abrupt("return", _res4);

                                            case 18:
                                            case "end":
                                                return _context13.stop();
                                        }
                                    }
                                }, _callee13, _this13, [[3, 11]]);
                            }));

                            return function (_x44, _x45, _x46, _x47) {
                                return ref.apply(this, arguments);
                            };
                        })());
                        _context14.next = 6;
                        return mapSerialAsync(createOrUpdate(apiSpec, method, resourceId), responses);

                    case 6:
                        return _context14.abrupt("return", _context14.sent);

                    case 7:
                    case "end":
                        return _context14.stop();
                }
            }
        }, _callee14, _this14);
    }));

    return function (_x40, _x41, _x42, _x43) {
        return ref.apply(this, arguments);
    };
})());

var createOrUpdateIntegrationResponses = _ramda2.default.curry((function () {
    var _this16 = this;

    var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee16(logFn, apiSpec, methodSpec, resourceId) {
        var method, addCode, responses, propMatch, has200RespCode, createOrUpdate;
        return regeneratorRuntime.wrap(function _callee16$(_context16) {
            while (1) {
                switch (_context16.prev = _context16.next) {
                    case 0:
                        method = methodSpec.method.toUpperCase();

                        addCode = function addCode(val, key) {
                            return _ramda2.default.assoc("statusCode", key, val);
                        };

                        responses = _ramda2.default.values(_ramda2.default.mapObjIndexed(addCode, methodSpec.responses));

                        propMatch = function propMatch(prop, regex) {
                            return _ramda2.default.compose(_ramda2.default.not, _ramda2.default.isEmpty, _ramda2.default.match(regex), _ramda2.default.prop(prop));
                        };

                        has200RespCode = propMatch("statusCode", /2\d{2}/);

                        if (!(_ramda2.default.filter(has200RespCode, responses).length > 1)) {
                            _context16.next = 7;
                            break;
                        }

                        throw new Error("sorry, " + method + " " + methodSpec.path + " can't have more than one 2xx response");

                    case 7:
                        createOrUpdate = _ramda2.default.curry((function () {
                            var _this15 = this;

                            var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee15(apiSpec, method, resourceId, response) {
                                var selectionPattern, _res5;

                                return regeneratorRuntime.wrap(function _callee15$(_context15) {
                                    while (1) {
                                        switch (_context15.prev = _context15.next) {
                                            case 0:
                                                selectionPattern = has200RespCode(response) ? null : response.statusCode;
                                                _context15.prev = 1;
                                                _context15.next = 4;
                                                return _apigateway2.default.createIntegrationResponse(apiSpec.region, apiSpec.api.id, resourceId, method, response.statusCode, selectionPattern);

                                            case 4:
                                                _res5 = _context15.sent;

                                                logFn("info", "created integration response " + methodSpec.method.toUpperCase() + " " + methodSpec.path);
                                                return _context15.abrupt("return", _res5);

                                            case 9:
                                                _context15.prev = 9;
                                                _context15.t0 = _context15["catch"](1);

                                            case 11:
                                            case "end":
                                                return _context15.stop();
                                        }
                                    }
                                }, _callee15, _this15, [[1, 9]]);
                            }));

                            return function (_x52, _x53, _x54, _x55) {
                                return ref.apply(this, arguments);
                            };
                        })());
                        _context16.next = 10;
                        return mapSerialAsync(createOrUpdate(apiSpec, method, resourceId), responses);

                    case 10:
                        return _context16.abrupt("return", _context16.sent);

                    case 11:
                    case "end":
                        return _context16.stop();
                }
            }
        }, _callee16, _this16);
    }));

    return function (_x48, _x49, _x50, _x51) {
        return ref.apply(this, arguments);
    };
})());

var zip = _ramda2.default.curry((function () {
    var _this17 = this;

    var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee17(logFn, apiSpec, spec, functionName) {
        var res;
        return regeneratorRuntime.wrap(function _callee17$(_context17) {
            while (1) {
                switch (_context17.prev = _context17.next) {
                    case 0:
                        _context17.next = 2;
                        return (0, _lambdazip2.default)(apiSpec.dest + "/" + apiSpec.stage + spec.path + "/" + spec.method, functionName);

                    case 2:
                        res = _context17.sent;

                        logFn("info", "created lambda zip " + spec.method.toUpperCase() + " " + spec.path);
                        return _context17.abrupt("return", res);

                    case 5:
                    case "end":
                        return _context17.stop();
                }
            }
        }, _callee17, _this17);
    }));

    return function (_x56, _x57, _x58, _x59) {
        return ref.apply(this, arguments);
    };
})());

var bindEndpointAndFunction = _ramda2.default.curry((function () {
    var _this18 = this;

    var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee18(logFn, apiSpec, methodSpec) {
        var resourceId, functionName, createEndpoint, result;
        return regeneratorRuntime.wrap(function _callee18$(_context18) {
            while (1) {
                switch (_context18.prev = _context18.next) {
                    case 0:
                        resourceId = _ramda2.default.prop("id", _ramda2.default.find(_ramda2.default.propEq("path", methodSpec.path), apiSpec.resources));
                        functionName = lambdaFunctionName(apiSpec, methodSpec);
                        createEndpoint = _ramda2.default.composeP(function () {
                            return createOrUpdateIntegrationResponses(logFn, apiSpec, methodSpec, resourceId);
                        }, function () {
                            return createOrUpdateMethodResponses(logFn, apiSpec, methodSpec, resourceId);
                        }, function () {
                            return createOrUpdateIntegration(logFn, apiSpec, methodSpec, resourceId, functionName);
                        }, function () {
                            return addMethodPermission(logFn, apiSpec, methodSpec, functionName);
                        }, createGatewayLambdaFunction(logFn, apiSpec, functionName), zip(logFn, apiSpec, methodSpec));
                        _context18.next = 5;
                        return createEndpoint(functionName);

                    case 5:
                        result = _context18.sent;

                        logFn("ok", "deployed " + methodSpec.method.toUpperCase() + " " + methodSpec.path);
                        return _context18.abrupt("return", result);

                    case 8:
                    case "end":
                        return _context18.stop();
                }
            }
        }, _callee18, _this18);
    }));

    return function (_x60, _x61, _x62) {
        return ref.apply(this, arguments);
    };
})());

var go = _ramda2.default.curry((function () {
    var _this19 = this;

    var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee19(action, logFn, region, env, stage, dest, spec) {
        var accountId, api, lambdaFunctions, filenameFn, apiSpec;
        return regeneratorRuntime.wrap(function _callee19$(_context19) {
            while (1) {
                switch (_context19.prev = _context19.next) {
                    case 0:
                        _context19.prev = 0;
                        _context19.next = 3;
                        return awsAccountId();

                    case 3:
                        accountId = _context19.sent;
                        _context19.next = 6;
                        return createApi(logFn, region, spec.info.title + "-" + env, spec.info.title);

                    case 6:
                        api = _context19.sent;
                        _context19.next = 9;
                        return listAllFunctions(region);

                    case 9:
                        lambdaFunctions = _context19.sent;

                        // let filenameFn        = endpointModuleFilename(spec.info.title, env, stage, dest);
                        filenameFn = _ramda2.default.identity;
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
                        _context19.next = 14;
                        return (0, _transpile2.default)("src/" + stage, dest + "/" + stage, filenameFn);

                    case 14:
                        logFn("ok", "transpiled");

                        // install NPMs for each endpoint lambda function
                        _context19.next = 17;
                        return mapSerialAsync(installFunctionModules(dest, stage), apiSpec.endpoints);

                    case 17:
                        logFn("ok", "installed lambda function NPM modules");

                        // stop here if we're only building

                        if (!(action === "build")) {
                            _context19.next = 20;
                            break;
                        }

                        return _context19.abrupt("return");

                    case 20:
                        _context19.next = 22;
                        return createResources(region, api, spec);

                    case 22:
                        logFn("ok", "created missing resources");

                        _context19.next = 25;
                        return _apigateway2.default.resources(region, api.id);

                    case 25:
                        apiSpec.resources = _context19.sent;

                        logFn("ok", "fetched resources");

                        // Make sure all gateway endpoints are created
                        _context19.next = 29;
                        return _bluebird2.default.all(_ramda2.default.map(createOrUpdateMethod(region, api.id, apiSpec.resources, spec), apiSpec.endpoints));

                    case 29:
                        logFn("ok", "created method endpoints");

                        // Create lambda functions and bind them to the api gateway endpoint methods
                        _context19.next = 32;
                        return _bluebird2.default.all(_ramda2.default.map(bindEndpointAndFunction(logFn, apiSpec), apiSpec.endpoints));

                    case 32:
                        _context19.next = 34;
                        return _apigateway2.default.deploy(region, api.id, stage);

                    case 34:
                        logFn("ok", "deployed api to https://" + api.id + ".execute-api." + region + ".amazonaws.com/" + stage);
                        _context19.next = 41;
                        break;

                    case 37:
                        _context19.prev = 37;
                        _context19.t0 = _context19["catch"](0);

                        logFn("error", _context19.t0.stack);
                        throw _context19.t0;

                    case 41:
                    case "end":
                        return _context19.stop();
                }
            }
        }, _callee19, _this19, [[0, 37]]);
    }));

    return function (_x63, _x64, _x65, _x66, _x67, _x68, _x69) {
        return ref.apply(this, arguments);
    };
})());

exports.default = {
    createApi: createApi,
    createResources: createResources,
    listAllFunctions: listAllFunctions,
    go: go
};
module.exports = exports['default'];
