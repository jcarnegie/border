"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _child_process = require("child_process");

var _bluebird = require("bluebird");

var _bluebird2 = _interopRequireDefault(_bluebird);

var _npm = require("npm");

var _npm2 = _interopRequireDefault(_npm);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new _bluebird2.default(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { _bluebird2.default.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } step("next"); }); }; }

var install = function install(dir) {
    return new _bluebird2.default(function (resolve, reject) {
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

exports.default = (function () {
    var _this = this;

    var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(dir) {
        var cwd, data;
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        cwd = process.cwd();
                        data = null;

                        process.chdir(dir);

                        // await load(dir);
                        _context.next = 5;
                        return install(dir);

                    case 5:
                        data = _context.sent;

                        process.chdir(cwd);

                        return _context.abrupt("return", data);

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