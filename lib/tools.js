"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _this = this;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _swagger = require("./swagger");

var _swagger2 = _interopRequireDefault(_swagger);

var _deploy2 = require("./deploy");

var _deploy3 = _interopRequireDefault(_deploy2);

var _ramda = require("ramda");

var _ramda2 = _interopRequireDefault(_ramda);

exports["default"] = {
    deploy: function deploy(logFn, region, env, stage, dest) {
        var spec;
        return regeneratorRuntime.async(function deploy$(context$1$0) {
            while (1) switch (context$1$0.prev = context$1$0.next) {
                case 0:
                    context$1$0.next = 2;
                    return regeneratorRuntime.awrap(_swagger2["default"].build(stage));

                case 2:
                    spec = context$1$0.sent;
                    context$1$0.next = 5;
                    return regeneratorRuntime.awrap(_deploy3["default"].go(logFn, region, env, stage, dest, spec));

                case 5:
                    return context$1$0.abrupt("return", context$1$0.sent);

                case 6:
                case "end":
                    return context$1$0.stop();
            }
        }, null, _this);
    }
};
module.exports = exports["default"];