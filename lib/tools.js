"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _swagger = require("./swagger");

var _swagger2 = _interopRequireDefault(_swagger);

var _deploy2 = require("./deploy");

var _deploy3 = _interopRequireDefault(_deploy2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } step("next"); }); }; }

exports.default = {
    deploy: (function () {
        var _this = this;

        var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(action, logFn, region, env, stage, dest) {
            var spec;
            return regeneratorRuntime.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            _context.next = 2;
                            return _swagger2.default.build(stage);

                        case 2:
                            spec = _context.sent;
                            _context.next = 5;
                            return _deploy3.default.go(action, logFn, region, env, stage, dest, spec);

                        case 5:
                            return _context.abrupt("return", _context.sent);

                        case 6:
                        case "end":
                            return _context.stop();
                    }
                }
            }, _callee, _this);
        }));

        return function deploy(_x, _x2, _x3, _x4, _x5, _x6) {
            return ref.apply(this, arguments);
        };
    })()
};
module.exports = exports['default'];
