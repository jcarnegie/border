"use strict";

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _bluebird = require("bluebird");

var _bluebird2 = _interopRequireDefault(_bluebird);

var _glob = require("glob");

var _glob2 = _interopRequireDefault(_glob);

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _ramda = require("ramda");

var _ramda2 = _interopRequireDefault(_ramda);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new _bluebird2.default(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { _bluebird2.default.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } step("next"); }); }; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    * Configures a border dev webserver for local development.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    */

var awaitable = _bluebird2.default.promisify;
var glob = awaitable(_glob2.default);
var readFile = (function () {
    var _this = this;

    var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(path) {
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        _context.next = 2;
                        return awaitable(_fs2.default.readFile)(path, "utf8");

                    case 2:
                        return _context.abrupt("return", _context.sent);

                    case 3:
                    case "end":
                        return _context.stop();
                }
            }
        }, _callee, _this);
    }));

    return function readFile(_x) {
        return ref.apply(this, arguments);
    };
})();
var writeFile = _ramda2.default.curry((function () {
    var _this2 = this;

    var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(path, contents) {
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        _context2.next = 2;
                        return awaitable(_fs2.default.writeFile)(path, contents, null);

                    case 2:
                        return _context2.abrupt("return", _context2.sent);

                    case 3:
                    case "end":
                        return _context2.stop();
                }
            }
        }, _callee2, _this2);
    }));

    return function (_x2, _x3) {
        return ref.apply(this, arguments);
    };
})());
var append = _ramda2.default.curry(function (s2, s1) {
    return s1 + s2;
});

var removeBabelPolyfillRequire = (function () {
    var _this3 = this;

    var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(path) {
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        _context3.next = 2;
                        return _ramda2.default.composeP(writeFile(path), _ramda2.default.replace('require("babel-polyfill");', ""), readFile)(path);

                    case 2:
                        return _context3.abrupt("return", _context3.sent);

                    case 3:
                    case "end":
                        return _context3.stop();
                }
            }
        }, _callee3, _this3);
    }));

    return function removeBabelPolyfillRequire(_x4) {
        return ref.apply(this, arguments);
    };
})();

var ignoreNodeModules = _ramda2.default.compose(_ramda2.default.not, _ramda2.default.test(/node_modules/));

var isEven = function isEven(x) {
    return x % 2 === 0;
};
var isOdd = _ramda2.default.compose(_ramda2.default.not, isEven);
var filterIndexed = _ramda2.default.addIndex(_ramda2.default.filter);
var filterEvenIndexed = filterIndexed(function (x, idx) {
    return isEven(idx);
});
var filterOddIndexed = filterIndexed(function (x, idx) {
    return isOdd(idx);
});

exports.default = (function () {
    var _this4 = this;

    var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee4(app, stage) {
        var cwd, allFiles, files, endpointWrapper, extractEndpointData, addEndpoint, wireUpEndpoints, moduleName, moduleFiles;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
            while (1) {
                switch (_context4.prev = _context4.next) {
                    case 0:
                        cwd = process.cwd();
                        _context4.next = 3;
                        return glob(cwd + "/dist/" + stage + "/**/package.json");

                    case 3:
                        allFiles = _context4.sent;
                        files = _ramda2.default.filter(ignoreNodeModules, allFiles);
                        endpointWrapper = _ramda2.default.curry(function (handler, req, res) {
                            var headers = _ramda2.default.zipObj(filterEvenIndexed(req.rawHeaders), filterOddIndexed(req.rawHeaders));

                            var event = _extends({}, headers, req.query, req.param, {
                                body: req.body
                            });
                            var context = {
                                done: function done(err, data) {
                                    if (err) return res.status(500).send({ error: err });
                                    res.send(data);
                                }
                            };

                            handler(event, context);
                        });

                        extractEndpointData = function extractEndpointData(file) {
                            var cwd = process.cwd();
                            var dir = _path2.default.dirname(file);
                            var methodPath = dir.replace(new RegExp("^" + cwd + "/"), "").replace("dist/" + stage, "").replace(/\{([^\}]+)\}/, ":$1");
                            var pathParts = _ramda2.default.split("/", methodPath);
                            var method = _ramda2.default.last(pathParts);
                            var modulePath = _path2.default.dirname(file);
                            var path = _ramda2.default.join("/", _ramda2.default.prepend("/" + stage, _ramda2.default.tail(_ramda2.default.init(pathParts))));
                            var module = require(modulePath);
                            var handler = module.handler;

                            return {
                                methodPath: methodPath,
                                pathParts: pathParts,
                                method: method,
                                handler: handler,
                                path: path,
                                wrapper: endpointWrapper(handler)
                            };
                        };

                        addEndpoint = _ramda2.default.curry(function (app, ep) {
                            var method = ep.method.toUpperCase();
                            console.log("Adding endpoint " + method + " " + ep.path); // eslint-disable-line
                            app[ep.method](ep.path, ep.wrapper);
                        });
                        wireUpEndpoints = _ramda2.default.compose(_ramda2.default.map(addEndpoint(app)), _ramda2.default.map(extractEndpointData));
                        moduleName = _ramda2.default.compose(append("/index.js"), _path2.default.dirname);
                        moduleFiles = _ramda2.default.map(moduleName, files);
                        _context4.next = 13;
                        return _bluebird2.default.all(_ramda2.default.map(removeBabelPolyfillRequire, moduleFiles));

                    case 13:
                        wireUpEndpoints(files);

                        return _context4.abrupt("return", app);

                    case 15:
                    case "end":
                        return _context4.stop();
                }
            }
        }, _callee4, _this4);
    }));

    return function (_x5, _x6) {
        return ref.apply(this, arguments);
    };
})();

module.exports = exports['default'];
