"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _exec = require("./exec");

var _exec2 = _interopRequireDefault(_exec);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } step("next"); }); }; }

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
    var _this = this;

    var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(dir) {
        var commands, envCmd, cmd, result, output;
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        commands = [". ~/.nvm/nvm.sh",
                        // "nvm use v0.10.36",
                        "cd " + dir, "npm install"];
                        envCmd = process.env.BORDER_NPM_INSTALL_COMMAND;
                        cmd = envCmd ? envCmd.replace("%dir%", dir) : commands.join(" && ");
                        _context.next = 5;
                        return (0, _exec2.default)(cmd);

                    case 5:
                        result = _context.sent;
                        output = result[1];
                        return _context.abrupt("return", output);

                    case 8:
                    case "end":
                        return _context.stop();
                }
            }
        }, _callee, _this);
    }));

    return function (_x) {
        return ref.apply(this, arguments);
    };
})();

module.exports = exports['default'];
