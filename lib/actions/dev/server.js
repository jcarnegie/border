#!/usr/bin/env node
"use strict";

require("babel-polyfill");

var _bodyParser = require("body-parser");

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _configure = require("./configure");

var _configure2 = _interopRequireDefault(_configure);

var _express = require("express");

var _express2 = _interopRequireDefault(_express);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } step("next"); }); }; }

var main = (function () {
    var _this = this;

    var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee2() {
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        _context2.prev = 0;
                        return _context2.delegateYield(regeneratorRuntime.mark(function _callee() {
                            var app, stage, server;
                            return regeneratorRuntime.wrap(function _callee$(_context) {
                                while (1) {
                                    switch (_context.prev = _context.next) {
                                        case 0:
                                            app = (0, _express2.default)();

                                            app.use(_bodyParser2.default.json());

                                            stage = process.argv[2];
                                            _context.next = 5;
                                            return (0, _configure2.default)(app, stage);

                                        case 5:
                                            server = app.listen(3000, function () {
                                                var host = server.address().address;
                                                var port = server.address().port;
                                                console.log("API stage '" + stage + "' listening at http://%s:%s", host, port); // eslint-disable-line
                                            });

                                        case 6:
                                        case "end":
                                            return _context.stop();
                                    }
                                }
                            }, _callee, _this);
                        })(), "t0", 2);

                    case 2:
                        _context2.next = 7;
                        break;

                    case 4:
                        _context2.prev = 4;
                        _context2.t1 = _context2["catch"](0);

                        console.log("error:", _context2.t1.stack); // eslint-disable-line

                    case 7:
                    case "end":
                        return _context2.stop();
                }
            }
        }, _callee2, _this, [[0, 4]]);
    }));

    return function main() {
        return ref.apply(this, arguments);
    };
})();

main();
