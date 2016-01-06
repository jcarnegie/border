"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.createIntegrations = exports.createIntegration = undefined;

var _ramda = require("ramda");

var _ramda2 = _interopRequireDefault(_ramda);

var _util = require("./util");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } step("next"); }); }; }

var VALID_PARAMS = ["httpMethod", "resourceId", "restApiId", "type", "cacheKeyParameters", "cacheNamespace", "credentials", "integrationHttpMethod", "requestParameters", "requestTemplates", "uri"];

var makeParams = _ramda2.default.compose(_ramda2.default.pick(VALID_PARAMS), (0, _util.renameProp)("resourceMethod", "httpMethod"), (0, _util.renameProp)("httpMethod", "integrationHttpMethod"));

var createIntegration = exports.createIntegration = _ramda2.default.curry((function () {
    var _this = this;

    var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(gw, resources, integrationSpec) {
        var resource, resourceId, params;
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        resource = _ramda2.default.find(_ramda2.default.propEq("path", integrationSpec.path), resources);
                        resourceId = _ramda2.default.prop("id", resource);
                        params = makeParams(_ramda2.default.merge(integrationSpec, { resourceId: resourceId }));
                        _context.next = 5;
                        return gw.putIntegration(params);

                    case 5:
                        return _context.abrupt("return", _context.sent);

                    case 6:
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

var createIntegrations = exports.createIntegrations = function createIntegrations(gw, resources, integrations) {
    return _ramda2.default.map(createIntegration(gw, resources), integrations);
};
