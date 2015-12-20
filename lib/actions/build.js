"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _logger = require("./util/logger");

var _tools = require("../tools");

var _tools2 = _interopRequireDefault(_tools);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } step("next"); }); }; }

var region = process.env.AWS_DEFAULT_REGION;
var env = process.env.NODE_ENV || "development";

exports.default = (function () {
    var _this = this;

    var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(stage) {
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        _context.prev = 0;
                        _context.next = 3;
                        return _tools2.default.deploy("build", _logger.logger, region, env, stage, "dist");

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

    return function (_x) {
        return ref.apply(this, arguments);
    };
})();

module.exports = exports['default'];
