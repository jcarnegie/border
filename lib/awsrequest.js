"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _ramda = require("ramda");

var _ramda2 = _interopRequireDefault(_ramda);

var _aws = require("aws4");

var _aws2 = _interopRequireDefault(_aws);

var _https = require("https");

var _https2 = _interopRequireDefault(_https);

var _bluebird = require("bluebird");

var _bluebird2 = _interopRequireDefault(_bluebird);

var _timedq = require("./timedq");

var _timedq2 = _interopRequireDefault(_timedq);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new _bluebird2.default(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { _bluebird2.default.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } step("next"); }); }; }

var makeRequest = (function () {
    var _this = this;

    var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(options) {
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        return _context.abrupt("return", new _bluebird2.default(function (resolve, reject) {
                            var req = null;
                            var signedReq = null;
                            var opts = options || {};

                            opts.headers = opts.headers || {};
                            opts.body = opts.body || "";

                            if (opts.method === "POST" || opts.method === "PUT" || opts.method === "PATCH") {
                                opts.body = JSON.stringify(opts.body);
                                opts.headers["Content-Length"] = opts.body.length;
                            }

                            signedReq = _aws2.default.sign(opts);
                            req = _https2.default.request(signedReq, function (res) {
                                var data = "";
                                res.setEncoding("utf8");
                                res.on("data", function (chunk) {
                                    data += chunk;
                                });
                                res.on("end", function () {
                                    if (res.statusCode >= 400) {
                                        var error = data;
                                        try {
                                            error = JSON.parse(data).message;
                                        } catch (e) {/* gulp */}
                                        return reject(new Error(error), res.statusCode, res);
                                    }

                                    var jsonTypes = ["application/json", "application/hal+json"];
                                    if (_ramda2.default.contains(res.headers["content-type"], jsonTypes)) {
                                        data = JSON.parse(data);
                                    }
                                    // console.log(`resolving request: ${options.method.toUpperCase()} ${options.path}`);
                                    resolve(data, res);
                                });
                            });

                            req.on("error", function (e) {
                                // console.log(`rejecting request: ${options.method.toUpperCase()} ${options.path}`);
                                reject(e);
                            });

                            if (opts.method === "POST" || opts.method === "PUT" || opts.method === "PATCH") {
                                req.write(opts.body);
                            }

                            req.end();
                        }));

                    case 1:
                    case "end":
                        return _context.stop();
                }
            }
        }, _callee, _this);
    }));

    return function makeRequest(_x) {
        return ref.apply(this, arguments);
    };
})();

var request = (0, _timedq2.default)(makeRequest, 500);

var get = (function () {
    var _this2 = this;

    var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(opts) {
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        return _context2.abrupt("return", request(_ramda2.default.merge(opts, { method: "GET" })));

                    case 1:
                    case "end":
                        return _context2.stop();
                }
            }
        }, _callee2, _this2);
    }));

    return function get(_x2) {
        return ref.apply(this, arguments);
    };
})();

var post = (function () {
    var _this3 = this;

    var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(opts) {
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        return _context3.abrupt("return", request(_ramda2.default.merge(opts, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" }
                        })));

                    case 1:
                    case "end":
                        return _context3.stop();
                }
            }
        }, _callee3, _this3);
    }));

    return function post(_x3) {
        return ref.apply(this, arguments);
    };
})();

var put = (function () {
    var _this4 = this;

    var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee4(opts) {
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
            while (1) {
                switch (_context4.prev = _context4.next) {
                    case 0:
                        return _context4.abrupt("return", request(_ramda2.default.merge(opts, {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" }
                        })));

                    case 1:
                    case "end":
                        return _context4.stop();
                }
            }
        }, _callee4, _this4);
    }));

    return function put(_x4) {
        return ref.apply(this, arguments);
    };
})();

var patch = (function () {
    var _this5 = this;

    var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee5(opts) {
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
            while (1) {
                switch (_context5.prev = _context5.next) {
                    case 0:
                        return _context5.abrupt("return", request(_ramda2.default.merge(opts, {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" }
                        })));

                    case 1:
                    case "end":
                        return _context5.stop();
                }
            }
        }, _callee5, _this5);
    }));

    return function patch(_x5) {
        return ref.apply(this, arguments);
    };
})();

exports.default = {
    request: request,
    get: get,
    post: post,
    put: put,
    patch: patch
};
module.exports = exports['default'];
