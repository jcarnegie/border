"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _ramda = require("ramda");

var _ramda2 = _interopRequireDefault(_ramda);

var _path = require("path");

var _util = require("../util");

var _apigateway = require("../apigateway");

var _apigateway2 = _interopRequireDefault(_apigateway);

var _resources = require("../diff/resources");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } step("next"); }); }; }

var createResource = _ramda2.default.curry((function () {
    var _this = this;

    var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(region, apiId, awsResources, resourcePath) {
        var parentPath, parentResource, parentId, pathPart;
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        parentPath = (0, _path.dirname)(resourcePath);
                        parentResource = _ramda2.default.find(_ramda2.default.propEq("path", parentPath), awsResources);
                        parentId = parentResource.id;
                        pathPart = _ramda2.default.last(_ramda2.default.split("/", resourcePath));
                        _context.next = 6;
                        return _apigateway2.default.createResource(region, apiId, parentId, pathPart);

                    case 6:
                        return _context.abrupt("return", _context.sent);

                    case 7:
                    case "end":
                        return _context.stop();
                }
            }
        }, _callee, _this);
    }));

    return function (_x, _x2, _x3, _x4) {
        return ref.apply(this, arguments);
    };
})());

var createResources = _ramda2.default.curry((function () {
    var _this3 = this;

    var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(region, apiId, resources, resourcePaths) {
        var reducer;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        reducer = (function () {
                            var _this2 = this;

                            var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(resources, path) {
                                var resource;
                                return regeneratorRuntime.wrap(function _callee2$(_context2) {
                                    while (1) {
                                        switch (_context2.prev = _context2.next) {
                                            case 0:
                                                _context2.next = 2;
                                                return createResource(region, apiId, resources, path);

                                            case 2:
                                                resource = _context2.sent;
                                                return _context2.abrupt("return", _ramda2.default.append(resource, resources));

                                            case 4:
                                            case "end":
                                                return _context2.stop();
                                        }
                                    }
                                }, _callee2, _this2);
                            }));

                            return function reducer(_x9, _x10) {
                                return ref.apply(this, arguments);
                            };
                        })();

                        return _context3.abrupt("return", (0, _util.reduceAsync)(reducer, resources, resourcePaths));

                    case 2:
                    case "end":
                        return _context3.stop();
                }
            }
        }, _callee3, _this3);
    }));

    return function (_x5, _x6, _x7, _x8) {
        return ref.apply(this, arguments);
    };
})());

exports.default = (function () {
    var _this4 = this;

    var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee4(region, apiId, stage, awsResources, swaggerSpec) {
        var missingPaths;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
            while (1) {
                switch (_context4.prev = _context4.next) {
                    case 0:
                        missingPaths = (0, _resources.missingResourcePaths)(awsResources, swaggerSpec);
                        _context4.next = 3;
                        return createResources(region, apiId, awsResources, missingPaths);

                    case 3:
                        return _context4.abrupt("return", _context4.sent);

                    case 4:
                    case "end":
                        return _context4.stop();
                }
            }
        }, _callee4, _this4);
    }));

    return function (_x11, _x12, _x13, _x14, _x15) {
        return ref.apply(this, arguments);
    };
})();

module.exports = exports['default'];
