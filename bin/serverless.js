#!/usr/bin/env node
"use strict";

var _this = this;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _libTools = require("../lib/tools");

var _libTools2 = _interopRequireDefault(_libTools);

require("colors");

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
    console.log("[" + color(level) + "] " + msg);
};

var main = function main() {
    return regeneratorRuntime.async(function main$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                context$1$0.prev = 0;
                context$1$0.next = 3;
                return regeneratorRuntime.awrap(_libTools2["default"].deploy(logger, region, env, stage, "dist"));

            case 3:
                context$1$0.next = 8;
                break;

            case 5:
                context$1$0.prev = 5;
                context$1$0.t0 = context$1$0["catch"](0);

                console.error(context$1$0.t0);

            case 8:
            case "end":
                return context$1$0.stop();
        }
    }, null, _this, [[0, 5]]);
};

main();