"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _this = this;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _ramda = require("ramda");

var _ramda2 = _interopRequireDefault(_ramda);

// import qs from "querystring";

var _aws4 = require("aws4");

var _aws42 = _interopRequireDefault(_aws4);

var _https = require("https");

var _https2 = _interopRequireDefault(_https);

var _bluebird = require("bluebird");

var _bluebird2 = _interopRequireDefault(_bluebird);

var request = function request(options) {
    return regeneratorRuntime.async(function request$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                return context$1$0.abrupt("return", new _bluebird2["default"](function (resolve, reject) {
                    var req = null;
                    var signedReq = null;
                    var opts = options || {};

                    opts.headers = opts.headers || {};
                    opts.body = opts.body || "";

                    if (opts.method === "POST" || opts.method === "PUT" || opts.method === "PATCH") {
                        opts.body = JSON.stringify(opts.body);
                        opts.headers["Content-Length"] = opts.body.length;
                    }

                    signedReq = _aws42["default"].sign(opts);
                    req = _https2["default"].request(signedReq, function (res) {
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
                            if (_ramda2["default"].contains(res.headers["content-type"], jsonTypes)) {
                                data = JSON.parse(data);
                            }
                            resolve(data, res);
                        });
                    });

                    req.on("error", function (e) {
                        reject(e);
                    });

                    if (opts.method === "POST" || opts.method === "PUT" || opts.method === "PATCH") {
                        req.write(opts.body);
                    }

                    req.end();
                }));

            case 1:
            case "end":
                return context$1$0.stop();
        }
    }, null, _this);
};

var get = function get(opts) {
    return regeneratorRuntime.async(function get$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                return context$1$0.abrupt("return", request(_ramda2["default"].merge(opts, { method: "GET" })));

            case 1:
            case "end":
                return context$1$0.stop();
        }
    }, null, _this);
};

var post = function post(opts) {
    return regeneratorRuntime.async(function post$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                return context$1$0.abrupt("return", request(_ramda2["default"].merge(opts, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" }
                })));

            case 1:
            case "end":
                return context$1$0.stop();
        }
    }, null, _this);
};

var put = function put(opts) {
    return regeneratorRuntime.async(function put$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                return context$1$0.abrupt("return", request(_ramda2["default"].merge(opts, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" }
                })));

            case 1:
            case "end":
                return context$1$0.stop();
        }
    }, null, _this);
};

var patch = function patch(opts) {
    return regeneratorRuntime.async(function patch$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                return context$1$0.abrupt("return", request(_ramda2["default"].merge(opts, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" }
                })));

            case 1:
            case "end":
                return context$1$0.stop();
        }
    }, null, _this);
};

exports["default"] = {
    request: request,
    get: get,
    post: post,
    put: put,
    patch: patch
};
module.exports = exports["default"];