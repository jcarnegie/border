#!/usr/bin/env node
"use strict";

require("babel-polyfill");

var _commander = require("commander");

var _commander2 = _interopRequireDefault(_commander);

var _deploy = require("../lib/actions/deploy");

var _deploy2 = _interopRequireDefault(_deploy);

var _build = require("../lib/actions/build");

var _build2 = _interopRequireDefault(_build);

var _dev = require("../lib/actions/dev");

var _dev2 = _interopRequireDefault(_dev);

var _swagger = require("../lib/actions/swagger");

var _swagger2 = _interopRequireDefault(_swagger);

var _apigateway = require("../lib/apigateway");

var _apigateway2 = _interopRequireDefault(_apigateway);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } step("next"); }); }; }

_commander2.default.command("resources").action(_asyncToGenerator(regeneratorRuntime.mark(function _callee() {
    var res;
    return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    _context.prev = 0;
                    _context.next = 3;
                    return _apigateway2.default.embeddedResources("us-west-2", "fqn4zn1bif");

                case 3:
                    res = _context.sent;

                    console.log(JSON.stringify(res, null, 4));
                    _context.next = 10;
                    break;

                case 7:
                    _context.prev = 7;
                    _context.t0 = _context["catch"](0);

                    console.log(_context.t0);

                case 10:
                case "end":
                    return _context.stop();
            }
        }
    }, _callee, undefined, [[0, 7]]);
})));

_commander2.default.command("deploy <stage>").action(_deploy2.default);

_commander2.default.command("build <stage>").action(_build2.default);

_commander2.default.command("dev <stage>").action(_dev2.default);

_commander2.default.command("swagger <stage>").action(_swagger2.default);

_commander2.default.parse(process.argv);
