"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _bluebird = require("bluebird");

var _bluebird2 = _interopRequireDefault(_bluebird);

var _glob = require("glob");

var _glob2 = _interopRequireDefault(_glob);

var _ramda = require("ramda");

var _ramda2 = _interopRequireDefault(_ramda);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new _bluebird2.default(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { _bluebird2.default.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } step("next"); }); }; }

var awaitable = _bluebird2.default.promisify;
var glob = awaitable(_glob2.default);

exports.default = (function () {
    var _this = this;

    var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(app, stage) {
        var files, endpointWrapper, extractEndpointData, addEndpoint, endpointData, wireUpEndpoints;
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        _context.next = 2;
                        return glob("src/" + stage + "/**/package.json");

                    case 2:
                        files = _context.sent;
                        endpointWrapper = _ramda2.default.curry(function (handler, req, res) {
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
                            var methodPath = _path2.default.dirname(file).replace("src/" + stage, "");
                            var pathParts = _ramda2.default.split("/", methodPath);
                            var method = _ramda2.default.last(pathParts);
                            var handler = require("../" + _path2.default.dirname(file)).handler;

                            return {
                                methodPath: methodPath,
                                pathParts: pathParts,
                                method: method,
                                handler: handler,
                                path: _ramda2.default.join("/", _ramda2.default.init(pathParts)),
                                wrapper: endpointWrapper(handler)
                            };
                        };

                        addEndpoint = _ramda2.default.curry(function (app, ep) {
                            app[ep.method](ep.path, ep.wrapper);
                        });
                        endpointData = _ramda2.default.map(extractEndpointData, files);
                        wireUpEndpoints = _ramda2.default.compose(_ramda2.default.map(addEndpoint(app)), _ramda2.default.map(extractEndpointData));

                        wireUpEndpoints(files);

                        return _context.abrupt("return", app);

                    case 10:
                    case "end":
                        return _context.stop();
                }
            }
        }, _callee, _this);
    }));

    return function (_x, _x2) {
        return ref.apply(this, arguments);
    };
})();

module.exports = exports['default'];
