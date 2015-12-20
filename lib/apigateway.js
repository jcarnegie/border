"use strict";

var _arguments = arguments;
Object.defineProperty(exports, "__esModule", {
    value: true
});

var _ramda = require("ramda");

var _ramda2 = _interopRequireDefault(_ramda);

var _awsrequest = require("../lib/awsrequest");

var _awsrequest2 = _interopRequireDefault(_awsrequest);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } step("next"); }); }; }

var restapis = (function () {
    var _this = this;

    var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(region) {
        var reg, data, apis;
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        reg = region || process.env.AWS_DEFAULT_REGION;
                        _context.next = 3;
                        return _awsrequest2.default.get({
                            host: "apigateway." + reg + ".amazonaws.com",
                            region: reg,
                            path: "/restapis"
                        });

                    case 3:
                        data = _context.sent;

                        if (data._embedded) {
                            _context.next = 6;
                            break;
                        }

                        return _context.abrupt("return", []);

                    case 6:
                        // eslint-disable-line no-underscore-dangle

                        apis = data._embedded.item; // eslint-disable-line no-underscore-dangle
                        // if there's only one API, then AWS returns an object, not an array

                        if (!_ramda2.default.is(Array, apis)) apis = [apis];
                        return _context.abrupt("return", apis);

                    case 9:
                    case "end":
                        return _context.stop();
                }
            }
        }, _callee, _this);
    }));

    return function restapis(_x) {
        return ref.apply(this, arguments);
    };
})();

var createRestapi = _ramda2.default.curry((function () {
    var _this2 = this;

    var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(region, name, description) {
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        _context2.next = 2;
                        return _awsrequest2.default.post({
                            region: region,
                            host: "apigateway." + region + ".amazonaws.com",
                            path: "/restapis",
                            body: { name: name, description: description }
                        });

                    case 2:
                        return _context2.abrupt("return", _context2.sent);

                    case 3:
                    case "end":
                        return _context2.stop();
                }
            }
        }, _callee2, _this2);
    }));

    return function (_x2, _x3, _x4) {
        return ref.apply(this, arguments);
    };
})());

var resources = _ramda2.default.curry((function () {
    var _this3 = this;

    var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(region, apiId) {
        var res;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        _context3.next = 2;
                        return _awsrequest2.default.get({
                            region: region,
                            host: "apigateway." + region + ".amazonaws.com",
                            path: "/restapis/" + apiId + "/resources"
                        });

                    case 2:
                        res = _context3.sent;

                        res = res._embedded.item; // eslint-disable-line
                        if (!_ramda2.default.is(Array, res)) res = [res];
                        return _context3.abrupt("return", res);

                    case 6:
                    case "end":
                        return _context3.stop();
                }
            }
        }, _callee3, _this3);
    }));

    return function (_x5, _x6) {
        return ref.apply(this, arguments);
    };
})());

var createResource = (function () {
    var _this4 = this;

    var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee4(region, apiId, parentResourceId, pathPart) {
        var newResUrl;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
            while (1) {
                switch (_context4.prev = _context4.next) {
                    case 0:
                        newResUrl = "/restapis/" + apiId + "/resources/" + parentResourceId;
                        _context4.next = 3;
                        return _awsrequest2.default.post({
                            region: region,
                            host: "apigateway." + region + ".amazonaws.com",
                            path: newResUrl,
                            body: {
                                pathPart: pathPart,
                                name: pathPart.replace(/\{\}/, "")
                            }
                        });

                    case 3:
                        return _context4.abrupt("return", _context4.sent);

                    case 4:
                    case "end":
                        return _context4.stop();
                }
            }
        }, _callee4, _this4);
    }));

    return function createResource(_x7, _x8, _x9, _x10) {
        return ref.apply(this, arguments);
    };
})();

var method = (function () {
    var _this5 = this;

    var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee5(region, apiId, parentResourceId, _method) {
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
            while (1) {
                switch (_context5.prev = _context5.next) {
                    case 0:
                        _context5.next = 2;
                        return _awsrequest2.default.get({
                            region: region,
                            host: "apigateway." + region + ".amazonaws.com",
                            path: "/restapis/" + apiId + "/resources/" + parentResourceId + "/methods/" + _method.toUpperCase()
                        });

                    case 2:
                        return _context5.abrupt("return", _context5.sent);

                    case 3:
                    case "end":
                        return _context5.stop();
                }
            }
        }, _callee5, _this5);
    }));

    return function method(_x11, _x12, _x13, _x14) {
        return ref.apply(this, arguments);
    };
})();

var createMethod = (function () {
    var _this6 = this;

    var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee6(region, apiId, parentResourceId, method, requestParams) {
        var newMethUrl, params;
        return regeneratorRuntime.wrap(function _callee6$(_context6) {
            while (1) {
                switch (_context6.prev = _context6.next) {
                    case 0:
                        newMethUrl = "/restapis/" + apiId + "/resources/" + parentResourceId + "/methods/" + method.toUpperCase();
                        params = {
                            region: region,
                            host: "apigateway." + region + ".amazonaws.com",
                            path: newMethUrl,
                            body: {
                                authorizationType: "NONE",
                                requestParameters: requestParams
                            }
                        };
                        _context6.next = 4;
                        return _awsrequest2.default.put(params);

                    case 4:
                        return _context6.abrupt("return", _context6.sent);

                    case 5:
                    case "end":
                        return _context6.stop();
                }
            }
        }, _callee6, _this6);
    }));

    return function createMethod(_x15, _x16, _x17, _x18, _x19) {
        return ref.apply(this, arguments);
    };
})();

var updateMethod = (function () {
    var _this7 = this;

    var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee7(region, apiId, parentResourceId, method) {
        var requestParams = _arguments.length <= 4 || _arguments[4] === undefined ? {} : _arguments[4];
        var methodUrl, patchOp;
        return regeneratorRuntime.wrap(function _callee7$(_context7) {
            while (1) {
                switch (_context7.prev = _context7.next) {
                    case 0:
                        methodUrl = "/restapis/" + apiId + "/resources/" + parentResourceId + "/methods/" + method.toUpperCase();

                        patchOp = function patchOp(param) {
                            return { op: "add", path: "/requestParameters/" + param };
                        };

                        _context7.next = 4;
                        return _awsrequest2.default.patch({
                            region: region,
                            host: "apigateway." + region + ".amazonaws.com",
                            path: methodUrl,
                            body: {
                                patchOperations: _ramda2.default.map(patchOp, _ramda2.default.keys(requestParams))
                            }
                        });

                    case 4:
                        return _context7.abrupt("return", _context7.sent);

                    case 5:
                    case "end":
                        return _context7.stop();
                }
            }
        }, _callee7, _this7);
    }));

    return function updateMethod(_x20, _x21, _x22, _x23, _x24) {
        return ref.apply(this, arguments);
    };
})();

var createIntegration = (function () {
    var _this8 = this;

    var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee8(opts) {
        var props;
        return regeneratorRuntime.wrap(function _callee8$(_context8) {
            while (1) {
                switch (_context8.prev = _context8.next) {
                    case 0:
                        props = ["type", "httpMethod", "authorizationType", "uri", "credentials", "requestParameters", "requestTemplates", "cacheNamespace", "cacheKeyParameters"];
                        _context8.next = 3;
                        return _awsrequest2.default.put({
                            region: opts.region,
                            host: "apigateway." + opts.region + ".amazonaws.com",
                            path: "/restapis/" + opts.apiId + "/resources/" + opts.resourceId + "/methods/" + opts.method.toUpperCase() + "/integration",
                            body: _ramda2.default.pick(props, opts)
                        });

                    case 3:
                        return _context8.abrupt("return", _context8.sent);

                    case 4:
                    case "end":
                        return _context8.stop();
                }
            }
        }, _callee8, _this8);
    }));

    return function createIntegration(_x26) {
        return ref.apply(this, arguments);
    };
})();

var updateIntegration = (function () {
    var _this9 = this;

    var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee9(opts) {
        var ops;
        return regeneratorRuntime.wrap(function _callee9$(_context9) {
            while (1) {
                switch (_context9.prev = _context9.next) {
                    case 0:
                        ops = [{ op: "replace", path: "/httpMethod", value: opts.httpMethod }, { op: "replace", path: "/uri", value: opts.uri }, { op: "replace", path: "/credentials", value: opts.credentials }, { op: "replace", path: "/requestTemplates/application~1json", value: opts.requestTemplates }];
                        _context9.next = 3;
                        return _awsrequest2.default.patch({
                            region: opts.region,
                            host: "apigateway." + opts.region + ".amazonaws.com",
                            path: "/restapis/" + opts.apiId + "/resources/" + opts.resourceId + "/methods/" + opts.method.toUpperCase() + "/integration",
                            body: { patchOperations: ops }
                        });

                    case 3:
                        return _context9.abrupt("return", _context9.sent);

                    case 4:
                    case "end":
                        return _context9.stop();
                }
            }
        }, _callee9, _this9);
    }));

    return function updateIntegration(_x27) {
        return ref.apply(this, arguments);
    };
})();

var createMethodResponse = (function () {
    var _this10 = this;

    var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee10(region, apiId, resourceId, method, statusCode) {
        var responseParameters = _arguments.length <= 5 || _arguments[5] === undefined ? {} : _arguments[5];
        var responseModels = _arguments.length <= 6 || _arguments[6] === undefined ? {} : _arguments[6];
        return regeneratorRuntime.wrap(function _callee10$(_context10) {
            while (1) {
                switch (_context10.prev = _context10.next) {
                    case 0:
                        _context10.next = 2;
                        return _awsrequest2.default.put({
                            region: region,
                            host: "apigateway." + region + ".amazonaws.com",
                            path: "/restapis/" + apiId + "/resources/" + resourceId + "/methods/" + method.toUpperCase() + "/responses/" + statusCode,
                            body: {
                                responseModels: responseModels,
                                responseParameters: responseParameters
                            }
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

    return function createMethodResponse(_x28, _x29, _x30, _x31, _x32, _x33, _x34) {
        return ref.apply(this, arguments);
    };
})();

var updateMethodResponse = (function () {
    var _this11 = this;

    var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee11(region, apiId, resourceId, method, statusCode) {
        var responseParameters = _arguments.length <= 5 || _arguments[5] === undefined ? {} : _arguments[5];
        var genOp, ops;
        return regeneratorRuntime.wrap(function _callee11$(_context11) {
            while (1) {
                switch (_context11.prev = _context11.next) {
                    case 0:
                        _context11.prev = 0;

                        genOp = function genOp(param) {
                            return {
                                op: "add",
                                path: "/responseParameters/" + param
                            };
                        };

                        ops = _ramda2.default.map(genOp, _ramda2.default.keys(responseParameters));
                        _context11.next = 5;
                        return _awsrequest2.default.patch({
                            region: region,
                            host: "apigateway." + region + ".amazonaws.com",
                            path: "/restapis/" + apiId + "/resources/" + resourceId + "/methods/" + method.toUpperCase() + "/responses/" + statusCode,
                            body: {
                                patchOperations: ops
                            }
                        });

                    case 5:
                        return _context11.abrupt("return", _context11.sent);

                    case 8:
                        _context11.prev = 8;
                        _context11.t0 = _context11["catch"](0);

                    case 10:
                    case "end":
                        return _context11.stop();
                }
            }
        }, _callee11, _this11, [[0, 8]]);
    }));

    return function updateMethodResponse(_x37, _x38, _x39, _x40, _x41, _x42) {
        return ref.apply(this, arguments);
    };
})();

// console.log("updateMethodResponse error:", e);
// throw e;
var createIntegrationResponse = (function () {
    var _this12 = this;

    var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee12(region, apiId, resourceId, method, statusCode, selectionPattern) {
        var params;
        return regeneratorRuntime.wrap(function _callee12$(_context12) {
            while (1) {
                switch (_context12.prev = _context12.next) {
                    case 0:
                        params = {
                            region: region,
                            host: "apigateway." + region + ".amazonaws.com",
                            path: "/restapis/" + apiId + "/resources/" + resourceId + "/methods/" + method.toUpperCase() + "/integration/responses/" + statusCode,
                            body: {
                                selectionPattern: selectionPattern,
                                responseTemplates: { "application/json": null }
                            }
                        };
                        _context12.next = 3;
                        return _awsrequest2.default.put(params);

                    case 3:
                        return _context12.abrupt("return", _context12.sent);

                    case 4:
                    case "end":
                        return _context12.stop();
                }
            }
        }, _callee12, _this12);
    }));

    return function createIntegrationResponse(_x44, _x45, _x46, _x47, _x48, _x49) {
        return ref.apply(this, arguments);
    };
})();

var deployments = (function () {
    var _this13 = this;

    var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee13(region, apiId) {
        return regeneratorRuntime.wrap(function _callee13$(_context13) {
            while (1) {
                switch (_context13.prev = _context13.next) {
                    case 0:
                        _context13.next = 2;
                        return _awsrequest2.default.get({
                            region: region,
                            host: "apigateway." + region + ".amazonaws.com",
                            path: "/restapis/" + apiId + "/deployments"
                        });

                    case 2:
                        return _context13.abrupt("return", _context13.sent);

                    case 3:
                    case "end":
                        return _context13.stop();
                }
            }
        }, _callee13, _this13);
    }));

    return function deployments(_x50, _x51) {
        return ref.apply(this, arguments);
    };
})();

var deploy = (function () {
    var _this14 = this;

    var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee14(region, apiId, stageName, stageDescription, description) {
        return regeneratorRuntime.wrap(function _callee14$(_context14) {
            while (1) {
                switch (_context14.prev = _context14.next) {
                    case 0:
                        _context14.next = 2;
                        return _awsrequest2.default.post({
                            region: region,
                            host: "apigateway." + region + ".amazonaws.com",
                            path: "/restapis/" + apiId + "/deployments",
                            body: {
                                stageName: stageName,
                                stageDescription: stageDescription,
                                description: description
                            }
                        });

                    case 2:
                        return _context14.abrupt("return", _context14.sent);

                    case 3:
                    case "end":
                        return _context14.stop();
                }
            }
        }, _callee14, _this14);
    }));

    return function deploy(_x52, _x53, _x54, _x55, _x56) {
        return ref.apply(this, arguments);
    };
})();

var stages = (function () {
    var _this15 = this;

    var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee15(region, apiId) {
        return regeneratorRuntime.wrap(function _callee15$(_context15) {
            while (1) {
                switch (_context15.prev = _context15.next) {
                    case 0:
                        _context15.next = 2;
                        return _awsrequest2.default.get({
                            region: region,
                            host: "apigateway." + region + ".amazonaws.com",
                            path: "/restapis/" + apiId + "/stages"
                        });

                    case 2:
                        return _context15.abrupt("return", _context15.sent);

                    case 3:
                    case "end":
                        return _context15.stop();
                }
            }
        }, _callee15, _this15);
    }));

    return function stages(_x57, _x58) {
        return ref.apply(this, arguments);
    };
})();

exports.default = {
    restapis: restapis,
    createRestapi: createRestapi,
    resources: resources,
    createResource: createResource,
    method: method,
    createMethod: createMethod,
    updateMethod: updateMethod,
    createIntegration: createIntegration,
    updateIntegration: updateIntegration,
    createMethodResponse: createMethodResponse,
    updateMethodResponse: updateMethodResponse,
    createIntegrationResponse: createIntegrationResponse,
    deployments: deployments,
    deploy: deploy,
    stages: stages
};
module.exports = exports['default'];
