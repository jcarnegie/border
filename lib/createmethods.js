"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.createMethods = exports.createMethod = undefined;

var _ramda = require("ramda");

var _ramda2 = _interopRequireDefault(_ramda);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } step("next"); }); }; }

var VALID_PARAMS = ["authorizationType", "httpMethod", "resourceId", "restApiId", "apiKeyRequired", "requestModels", "requestParameters"];

var createMethod = exports.createMethod = _ramda2.default.curry((function () {
    var _this = this;

    var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(gw, resources, methodSpec) {
        var resource, resourceId, params;
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        resource = _ramda2.default.find(_ramda2.default.propEq("path", methodSpec.path));
                        resourceId = _ramda2.default.prop("id", resource);
                        params = _ramda2.default.pick(VALID_PARAMS, _ramda2.default.merge(methodSpec, { resourceId: resourceId }));

                        console.log("creating method:", params);

                        _context.next = 6;
                        return gw.createMethod(params);

                    case 6:
                        return _context.abrupt("return", _context.sent);

                    case 7:
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

var createMethods = exports.createMethods = function createMethods(gw, resources, methods) {
    return _ramda2.default.map(createMethod(gw, resources), methods);
};
