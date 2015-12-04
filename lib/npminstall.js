"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _this = this;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _child_process = require("child_process");

var _bluebird = require("bluebird");

var _bluebird2 = _interopRequireDefault(_bluebird);

var _npm = require("npm");

var _npm2 = _interopRequireDefault(_npm);

var install = function install(dir) {
    return new _bluebird2["default"](function (resolve, reject) {
        var child = (0, _child_process.exec)("npm install");
        child.on("error", function (code) {
            reject(code, child.stdout, child.stderr);
        });
        child.on("exit", function (code) {
            if (code === 0) return resolve(child.stdout, child.stderr);
            reject(code, child.stdout, child.stderr);
        });
    });
};

exports["default"] = function callee$0$0(dir) {
    var cwd, data;
    return regeneratorRuntime.async(function callee$0$0$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                cwd = process.cwd();
                data = null;

                process.chdir(dir);

                // await load(dir);
                context$1$0.next = 5;
                return regeneratorRuntime.awrap(install(dir));

            case 5:
                data = context$1$0.sent;

                process.chdir(cwd);

                return context$1$0.abrupt("return", data);

            case 8:
            case "end":
                return context$1$0.stop();
        }
    }, null, _this);
};

module.exports = exports["default"];