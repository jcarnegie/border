"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _this = this;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _bluebird = require("bluebird");

var _bluebird2 = _interopRequireDefault(_bluebird);

var _glob = require("glob");

var _glob2 = _interopRequireDefault(_glob);

var _ramda = require("ramda");

var _ramda2 = _interopRequireDefault(_ramda);

var awaitable = _bluebird2["default"].promisify;
var glob = awaitable(_glob2["default"]);

exports["default"] = function callee$0$0(app, stage) {
    var files, endpointWrapper, extractEndpointData, addEndpoint, endpointData, wireUpEndpoints;
    return regeneratorRuntime.async(function callee$0$0$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                context$1$0.next = 2;
                return regeneratorRuntime.awrap(glob("src/" + stage + "/**/package.json"));

            case 2:
                files = context$1$0.sent;
                endpointWrapper = _ramda2["default"].curry(function (handler, req, res) {
                    var event = {};
                    var context = {
                        done: function done(err, data) {
                            if (err) return res.status(500).send({ error: err });
                            res.send(data);
                        }
                    };
                    handler(event, context);
                });

                extractEndpointData = function extractEndpointData(file) {
                    var methodPath = _path2["default"].dirname(file).replace("src/" + stage, "");
                    var pathParts = _ramda2["default"].split("/", methodPath);
                    var method = _ramda2["default"].last(pathParts);
                    var handler = require("../" + _path2["default"].dirname(file)).handler;

                    return {
                        methodPath: methodPath,
                        pathParts: pathParts,
                        method: method,
                        handler: handler,
                        path: _ramda2["default"].join("/", _ramda2["default"].init(pathParts)),
                        wrapper: endpointWrapper(handler)
                    };
                };

                addEndpoint = _ramda2["default"].curry(function (app, ep) {
                    app[ep.method](ep.path, ep.wrapper);
                });
                endpointData = _ramda2["default"].map(extractEndpointData, files);
                wireUpEndpoints = _ramda2["default"].compose(_ramda2["default"].map(addEndpoint(app)), _ramda2["default"].map(extractEndpointData));

                wireUpEndpoints(files);

                return context$1$0.abrupt("return", app);

            case 10:
            case "end":
                return context$1$0.stop();
        }
    }, null, _this);
};

module.exports = exports["default"];