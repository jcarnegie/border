"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.push = undefined;

var _ramda = require("ramda");

var _ramda2 = _interopRequireDefault(_ramda);

var _apigateway = require("./apigateway");

var _apigateway2 = _interopRequireDefault(_apigateway);

var _gateway = require("./gateway");

var _swagger = require("./swagger");

var _missingresourcepaths = require("./extractors/missingresourcepaths");

var _missingmethods = require("./extractors/missingmethods");

var _updatedmethods = require("./extractors/updatedmethods");

var _createresources = require("./createresources");

var _createmethods = require("./createmethods");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } step("next"); }); }; }

var assocApiId = _ramda2.default.assoc("restApiId");

var push = exports.push = _ramda2.default.curry((function () {
    var _this = this;

    var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(region, apiId, stage) {
        var gw, assocApiIds, apigwResources, swaggerSpec, missingPaths, missingMethods, updatedMethods;
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        gw = (0, _gateway.gatewayMethods)(region);
                        assocApiIds = _ramda2.default.map(assocApiId(apiId));
                        _context.next = 4;
                        return _apigateway2.default.embeddedResources(region, apiId);

                    case 4:
                        apigwResources = _context.sent;
                        _context.next = 7;
                        return (0, _swagger.build)(stage);

                    case 7:
                        swaggerSpec = _context.sent;
                        missingPaths = (0, _missingresourcepaths.missingResourcePaths)(apigwResources, swaggerSpec);
                        missingMethods = (0, _missingmethods.missingMethods)(apigwResources, swaggerSpec);
                        updatedMethods = (0, _updatedmethods.updatedMethods)(apigwResources, swaggerSpec);
                        _context.next = 13;
                        return (0, _createresources.createResources)(region, apiId, apigwResources, missingPaths);

                    case 13:
                        _context.next = 15;
                        return (0, _createmethods.createMethods)(gw, apigwResources, assocApiIds(missingMethods));

                    case 15:
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
