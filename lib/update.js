"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _apigateway = require("./apigateway");

var _apigateway2 = _interopRequireDefault(_apigateway);

var _swagger = require("./swagger");

var _swagger2 = _interopRequireDefault(_swagger);

var _resources = require("./update/resources");

var _resources2 = _interopRequireDefault(_resources);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } step("next"); }); }; }

exports.default = (function () {
    var _this = this;

    var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(region, apiId, stage) {
        var awsgwResourceData, swaggerSpec;
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        _context.next = 2;
                        return _apigateway2.default.embeddedResources(region, apiId);

                    case 2:
                        awsgwResourceData = _context.sent;
                        _context.next = 5;
                        return _swagger2.default.build(stage);

                    case 5:
                        swaggerSpec = _context.sent;
                        _context.next = 8;
                        return (0, _resources2.default)(region, apiId, stage, awsgwResourceData, swaggerSpec);

                    case 8:
                    case "end":
                        return _context.stop();
                }
            }
        }, _callee, _this);
    }));

    return function (_x, _x2, _x3) {
        return ref.apply(this, arguments);
    };
})();

module.exports = exports['default'];
