"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _bluebird = require("bluebird");

var _bluebird2 = _interopRequireDefault(_bluebird);

var _exec = require("./exec");

var _exec2 = _interopRequireDefault(_exec);

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new _bluebird2.default(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { _bluebird2.default.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } step("next"); }); }; }

var readFile = _bluebird2.default.promisify(_fs2.default.readFile);

exports.default = (function () {
    var _this = this;

    var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(endpointDir) {
        var zipFile, zipPath, cmd, code, msg;
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        zipFile = "endpoint.zip";
                        zipPath = _path2.default.join(endpointDir, zipFile);
                        cmd = ["cd '" + endpointDir + "'", "zip -9r " + zipFile + " *"].join(" && ");
                        _context.next = 5;
                        return (0, _exec2.default)(cmd);

                    case 5:
                        code = _context.sent;

                        if (!(code !== 0)) {
                            _context.next = 9;
                            break;
                        }

                        msg = "exit code '" + code + "' for " + cmd;
                        throw new Error(msg);

                    case 9:
                        _context.next = 11;
                        return readFile(zipPath);

                    case 11:
                        return _context.abrupt("return", _context.sent);

                    case 12:
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
