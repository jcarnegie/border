"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _bluebird = require("bluebird");

var _bluebird2 = _interopRequireDefault(_bluebird);

var _shelljs = require("shelljs");

var _shelljs2 = _interopRequireDefault(_shelljs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new _bluebird2.default(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { _bluebird2.default.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } step("next"); }); }; }

var exec = (function () {
    var _this = this;

    var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(command) {
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        return _context.abrupt("return", new _bluebird2.default(function (resolve) {
                            var silent = true;
                            var async = true;
                            var options = { silent: silent, async: async };
                            _shelljs2.default.exec(command, options, function (code, output) {
                                resolve(code, output);
                            });
                        }));

                    case 1:
                    case "end":
                        return _context.stop();
                }
            }
        }, _callee, _this);
    }));

    return function exec(_x) {
        return ref.apply(this, arguments);
    };
})();

// let install = () => {
//     return new Promise((resolve, reject) => {
//         let child = exec("npm install");
//         child.on("error", (code) => {
//             reject(code, child.stdout, child.stderr);
//         });
//         child.on("exit", (code) => {
//             if (code === 0) return resolve(child.stdout, child.stderr);
//             reject(code, child.stdout, child.stderr);
//         });
//     });
// };

exports.default = (function () {
    var _this2 = this;

    var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(dir) {
        var commands, envCmd, cmd, result, output;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        commands = [". ~/.nvm/nvm.sh", "nvm use v0.10.36", "cd " + dir, "npm install"];
                        envCmd = process.env.BORDER_NPM_INSTALL_COMMAND;
                        cmd = envCmd ? envCmd.replace("%dir%", dir) : commands.join(" && ");
                        _context2.next = 5;
                        return exec(cmd);

                    case 5:
                        result = _context2.sent;
                        output = result[1];
                        return _context2.abrupt("return", output);

                    case 8:
                    case "end":
                        return _context2.stop();
                }
            }
        }, _callee2, _this2);
    }));

    return function (_x2) {
        return ref.apply(this, arguments);
    };
})();

module.exports = exports['default'];
