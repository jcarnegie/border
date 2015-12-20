#!/usr/bin/env node
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

require("babel-polyfill");

var _bluebird = require("bluebird");

var _bluebird2 = _interopRequireDefault(_bluebird);

var _chokidar = require("chokidar");

var _chokidar2 = _interopRequireDefault(_chokidar);

var _transformfile = require("../../transformfile");

var _transformfile2 = _interopRequireDefault(_transformfile);

var _child_process = require("child_process");

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _ramda = require("ramda");

var _ramda2 = _interopRequireDefault(_ramda);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new _bluebird2.default(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { _bluebird2.default.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } step("next"); }); }; }

var server = null;
var srcWatcher = null;
var writeFile = _bluebird2.default.promisify(_fs2.default.writeFile);

var start = (function () {
    var _this2 = this;

    var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(stage) {
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        try {
                            (function () {
                                var cwd = process.cwd();
                                var node = process.argv[0];
                                var path = "node_modules/border/lib/actions/dev/server.js";

                                server = (0, _child_process.spawn)(node, [path, stage]);
                                server.stdout.on("data", function (data) {
                                    return process.stdout.write(data.toString());
                                });
                                server.stderr.on("data", function (data) {
                                    return process.stderr.write(data.toString());
                                });

                                srcWatcher = _chokidar2.default.watch(cwd + "/src/" + stage + "/**/*.js");

                                var isJsFile = function isJsFile(path) {
                                    return _ramda2.default.test(/\.js$/, path);
                                };

                                var addSrcPath = function addSrcPath(path) {
                                    if (isJsFile(path)) {
                                        srcWatcher.add(path);
                                    }
                                };

                                var tpSrc = (function () {
                                    var _this = this;

                                    var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(src) {
                                        var stagePath, dest, result;
                                        return regeneratorRuntime.wrap(function _callee$(_context) {
                                            while (1) {
                                                switch (_context.prev = _context.next) {
                                                    case 0:
                                                        stagePath = src.replace(new RegExp("^" + cwd + "/src/"), "");
                                                        dest = cwd + "/dist/" + stagePath;
                                                        _context.next = 4;
                                                        return (0, _transformfile2.default)(src);

                                                    case 4:
                                                        result = _context.sent;
                                                        _context.next = 7;
                                                        return writeFile(dest, result.code);

                                                    case 7:
                                                        restart(stage);

                                                    case 8:
                                                    case "end":
                                                        return _context.stop();
                                                }
                                            }
                                        }, _callee, _this);
                                    }));

                                    return function tpSrc(_x2) {
                                        return ref.apply(this, arguments);
                                    };
                                })();

                                srcWatcher.on("add", addSrcPath).on("change", tpSrc);
                            })();
                        } catch (e) {
                            console.log("error:", e.stack); // eslint-disable-line
                        }

                    case 1:
                    case "end":
                        return _context2.stop();
                }
            }
        }, _callee2, _this2);
    }));

    return function start(_x) {
        return ref.apply(this, arguments);
    };
})();

var stop = function stop() {
    srcWatcher.close();
    server.kill();
};

var restart = function restart(stage) {
    stop();
    start(stage);
};

exports.default = { start: start, stop: stop, restart: restart };
module.exports = exports['default'];
