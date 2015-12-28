"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _swagger = require("../../lib/swagger");

var _swagger2 = _interopRequireDefault(_swagger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } step("next"); }); }; }

exports.default = (function () {
    var _this = this;

    var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(stage) {
        var spec;
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        _context.next = 2;
                        return _swagger2.default.build(stage);

                    case 2:
                        spec = _context.sent;

                        console.log(JSON.stringify(spec, null, 4)); // eslint-disable-line

                    case 4:
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
