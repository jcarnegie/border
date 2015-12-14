#!/usr/bin/env node
"use strict";

require("babel-polyfill");

var _tools = require("../lib/tools");

var _tools2 = _interopRequireDefault(_tools);

require("colors");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } step("next"); }); }; }

var region = process.env.AWS_DEFAULT_REGION;
var env = process.env.NODE_ENV || "development";
var stage = process.argv[2];
var color = function color(str) {
    switch (str) {
        case "ok":
            return str.green;
        case "warn":
        case "warning":
            return str.yellow;
        case "err":
        case "error":
            return str.red;
        case "fatal":
            return str.black;
        default:
            return str;
    }
};
var logger = function logger(level, msg) {
    console.log("[" + color(level) + "] " + msg); // eslint-disable-line no-console
};

var main = (function () {
    var _this = this;

    var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        _context.prev = 0;
                        _context.next = 3;
                        return _tools2.default.deploy(logger, region, env, stage, "dist");

                    case 3:
                        _context.next = 8;
                        break;

                    case 5:
                        _context.prev = 5;
                        _context.t0 = _context["catch"](0);

                        console.error(_context.t0); // eslint-disable-line no-console

                    case 8:
                    case "end":
                        return _context.stop();
                }
            }
        }, _callee, _this, [[0, 5]]);
    }));

    return function main() {
        return ref.apply(this, arguments);
    };
})();

main();