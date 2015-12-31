"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.push = undefined;

var _ramda = require("ramda");

var _ramda2 = _interopRequireDefault(_ramda);

var _apigateway = require("./apigateway");

var _apigateway2 = _interopRequireDefault(_apigateway);

var _swagger = require("./swagger");

var _missingresourcepaths = require("./extractors/missingresourcepaths");

var _createresources = require("./createresources");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } step("next"); }); }; }

var push = exports.push = _ramda2.default.curry((function () {
    var _this = this;

    var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(region, apiId, stage) {
        var apigwResources, swaggerSpec, missingPaths;
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        _context.next = 2;
                        return _apigateway2.default.embeddedResources(region, apiId);

                    case 2:
                        apigwResources = _context.sent;
                        _context.next = 5;
                        return (0, _swagger.build)(stage);

                    case 5:
                        swaggerSpec = _context.sent;
                        missingPaths = (0, _missingresourcepaths.missingResourcePaths)(apigwResources, swaggerSpec);
                        _context.next = 9;
                        return (0, _createresources.createResources)(region, apiId, apigwResources, missingPaths);

                    case 9:
                        return _context.abrupt("return", _context.sent);

                    case 10:
                    case "end":
                        return _context.stop();
                }
            }
        }, _callee, _this);
    }));

    return function (_x, _x2, _x3) {
        return ref.apply(this, arguments);
    };
})());
