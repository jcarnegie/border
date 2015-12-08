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

                        if (api) {
                            _context3.next = 11;
                            break;
                        }

                        _context3.next = 7;
                        return _apigateway2.default.createRestapi(region, name, desc);

                    case 7:
                        api = _context3.sent;

                        logFn("ok", "created API '" + name + "'");
                        _context3.next = 12;
                        break;

                    case 11:
                        logFn("ok", "found existing API '" + name + "'");

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
        var deployedResources, pathsToDeploy, deployedPaths, pathsToCreate, root, createPath;
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
                        _context5.next = 10;
                        return _ramda2.default.map(createPath(api, deployedResources, root), _ramda2.default.sort(_ramda2.default.gt, [].concat(_toConsumableArray(pathsToCreate))));

                    case 10:
                        return _context5.abrupt("return", _context5.sent);

                    case 11:
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

    var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee7(existingFunctions, params) {
        var func, updateParams, codeParams;
        return regeneratorRuntime.wrap(function _callee7$(_context7) {
            while (1) {
                switch (_context7.prev = _context7.next) {
                    case 0:
                        func = _ramda2.default.find(_ramda2.default.propEq("FunctionName", params.FunctionName), existingFunctions);

                        if (!func) {
                            _context7.next = 14;
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
                        _context7.next = 11;
                        return updateFunctionConfiguration(updateParams);

                    case 11:
                        return _context7.abrupt("return", _context7.sent);

                    case 14:
                        _context7.next = 16;
                        return createFunction(params);

                    case 16:
                        return _context7.abrupt("return", _context7.sent);

                    case 17:
                    case "end":
                        return _context7.stop();
                }
            }
        }, _callee7, _this7);
    }));

    return function createOrUpdateFunction(_x16, _x17) {
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

    return function (_x18, _x19, _x20) {
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

    return function (_x21, _x22, _x23, _x24, _x25) {
        return ref.apply(this, arguments);
    };
})());

var createGatewayLambdaFunction = _ramda2.default.curry((function () {
    var _this10 = this;

    var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee10(apiSpec, functionName, zip) {
        return regeneratorRuntime.wrap(function _callee10$(_context10) {
            while (1) {
                switch (_context10.prev = _context10.next) {
                    case 0:
                        _context10.next = 2;
                        return createOrUpdateFunction(apiSpec.lambdaFunctions, {
                            Code: { ZipFile: zip },
                            FunctionName: functionName,
                            Handler: functionName + "." + apiSpec.defaultHandler,
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

    return function (_x26, _x27, _x28) {
        return ref.apply(this, arguments);
    };
})());

var addMethodPermission = _ramda2.default.curry((function () {
    var _this11 = this;

    var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee11(apiSpec, methodSpec, functionName) {
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
                        return _context11.abrupt("return", _context11.sent);

                    case 3:
                    case "end":
                        return _context11.stop();
                }
            }
        }, _callee11, _this11);
    }));

    return function (_x29, _x30, _x31) {
        return ref.apply(this, arguments);
    };
})());

var createOrUpdateIntegration = _ramda2.default.curry((function () {
    var _this12 = this;

    var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee12(apiSpec, methodSpec, resourceId, functionName) {
        var params, functionArn, paramNames, requestTemplates, opts;
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
                                requestTemplates[contentType] = JSON.stringify(templates);
                            })();
                        }

                        opts.requestTemplates = requestTemplates;

                        _context12.prev = 7;
                        _context12.next = 10;
                        return _apigateway2.default.createIntegration(opts);

                    case 10:
                        return _context12.abrupt("return", _context12.sent);

                    case 13:
                        _context12.prev = 13;
                        _context12.t0 = _context12["catch"](7);
                        _context12.next = 17;
                        return _apigateway2.default.updateIntegration(opts);

                    case 17:
                        return _context12.abrupt("return", _context12.sent);

                    case 18:
                    case "end":
                        return _context12.stop();
                }
            }
        }, _callee12, _this12, [[7, 13]]);
    }));

    return function (_x32, _x33, _x34, _x35) {
        return ref.apply(this, arguments);
    };
})());

var createOrUpdateMethodResponses = _ramda2.default.curry((function () {
    var _this14 = this;

    var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee14(apiSpec, methodSpec, resourceId) {
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
                                var headerParam, addParam, responseParameters;
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
                                                return _context13.abrupt("return", _context13.sent);

                                            case 9:
                                                _context13.prev = 9;
                                                _context13.t0 = _context13["catch"](3);
                                                _context13.next = 13;
                                                return _apigateway2.default.updateMethodResponse(apiSpec.region, apiSpec.api.id, resourceId, method, response.statusCode, responseParameters);

                                            case 13:
                                                return _context13.abrupt("return", _context13.sent);

                                            case 14:
                                            case "end":
                                                return _context13.stop();
                                        }
                                    }
                                }, _callee13, _this13, [[3, 9]]);
                            }));

                            return function (_x39, _x40, _x41, _x42) {
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

    return function (_x36, _x37, _x38) {
        return ref.apply(this, arguments);
    };
})());

var createOrUpdateIntegrationResponses = _ramda2.default.curry((function () {
    var _this16 = this;

    var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee16(apiSpec, methodSpec, resourceId) {
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
                                var selectionPattern;
                                return regeneratorRuntime.wrap(function _callee15$(_context15) {
                                    while (1) {
                                        switch (_context15.prev = _context15.next) {
                                            case 0:
                                                selectionPattern = has200RespCode(response) ? null : response.statusCode;
                                                _context15.prev = 1;
                                                _context15.next = 4;
                                                return _apigateway2.default.createIntegrationResponse(apiSpec.region, apiSpec.api.id, resourceId, method, response.statusCode, selectionPattern);

                                            case 4:
                                                return _context15.abrupt("return", _context15.sent);

                                            case 7:
                                                _context15.prev = 7;
                                                _context15.t0 = _context15["catch"](1);

                                            case 9:
                                            case "end":
                                                return _context15.stop();
                                        }
                                    }
                                }, _callee15, _this15, [[1, 7]]);
                            }));

                            return function (_x46, _x47, _x48, _x49) {
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

    return function (_x43, _x44, _x45) {
        return ref.apply(this, arguments);
    };
})());

var zip = _ramda2.default.curry((function () {
    var _this17 = this;

    var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee17(apiSpec, spec, functionName) {
        return regeneratorRuntime.wrap(function _callee17$(_context17) {
            while (1) {
                switch (_context17.prev = _context17.next) {
                    case 0:
                        _context17.next = 2;
                        return (0, _lambdazip2.default)(apiSpec.dest + "/" + apiSpec.stage + spec.path + "/" + spec.method, functionName);

                    case 2:
                        return _context17.abrupt("return", _context17.sent);

                    case 3:
                    case "end":
                        return _context17.stop();
                }
            }
        }, _callee17, _this17);
    }));

    return function (_x50, _x51, _x52) {
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
                            return createOrUpdateIntegrationResponses(apiSpec, methodSpec, resourceId);
                        }, function () {
                            return createOrUpdateMethodResponses(apiSpec, methodSpec, resourceId);
                        }, function () {
                            return createOrUpdateIntegration(apiSpec, methodSpec, resourceId, functionName);
                        }, function () {
                            return addMethodPermission(apiSpec, methodSpec, functionName);
                        }, createGatewayLambdaFunction(apiSpec, functionName), zip(apiSpec, methodSpec));
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

    return function (_x53, _x54, _x55) {
        return ref.apply(this, arguments);
    };
})());

var endpointModuleFilename = _ramda2.default.curry(function (apiName, env, stage, dest, filename) {
    var relPath = filename.replace(dest + "/" + stage + "/", "");
    var parts = _ramda2.default.init(relPath.split("/"));
    var dir = _path2.default.dirname(relPath);
    var basename = apiName + "-" + env + "-" + stage + "-" + parts.join("-");
    var name = dest + "/" + stage + "/" + dir + "/" + basename.replace(/(\{|\})/g, "_") + ".js";
    return name;
});

var go = _ramda2.default.curry((function () {
    var _this19 = this;

    var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee19(logFn, region, env, stage, dest, spec) {
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
                        _context19.next = 14;
                        return (0, _transpile2.default)("src/" + stage, dest + "/" + stage, filenameFn);

                    case 14:
                        logFn("ok", "transpiled");

                        _context19.next = 17;
                        return createResources(region, api, spec);

                    case 17:
                        logFn("ok", "created missing resources");

                        _context19.next = 20;
                        return _apigateway2.default.resources(region, api.id);

                    case 20:
                        apiSpec.resources = _context19.sent;

                        logFn("ok", "fetched resources");

                        // install NPMs for each endpoint lambda function
                        _context19.next = 24;
                        return mapSerialAsync(installFunctionModules(dest, stage), apiSpec.endpoints);

                    case 24:
                        logFn("ok", "installed lambda function NPM modules");

                        // Make sure all gateway endpoints are created
                        _context19.next = 27;
                        return _ramda2.default.map(createOrUpdateMethod(region, api.id, apiSpec.resources, spec), apiSpec.endpoints);

                    case 27:
                        logFn("ok", "created method endpoints");

                        // Create lambda functions and bind them to the api gateway endpoint methods
                        _context19.next = 30;
                        return _ramda2.default.map(bindEndpointAndFunction(logFn, apiSpec), apiSpec.endpoints);

                    case 30:
                        _context19.next = 32;
                        return _apigateway2.default.deploy(region, api.id, stage);

                    case 32:
                        logFn("ok", "deployed api to https://" + api.id + ".execute-api." + region + ".amazonaws.com/" + stage);
                        _context19.next = 39;
                        break;

                    case 35:
                        _context19.prev = 35;
                        _context19.t0 = _context19["catch"](0);

                        logFn("error", _context19.t0);
                        throw _context19.t0;

                    case 39:
                    case "end":
                        return _context19.stop();
                }
            }
        }, _callee19, _this19, [[0, 35]]);
    }));

    return function (_x56, _x57, _x58, _x59, _x60, _x61) {
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