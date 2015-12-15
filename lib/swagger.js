"use strict";

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _bluebird = require("bluebird");

var _bluebird2 = _interopRequireDefault(_bluebird);

var _glob = require("glob");

var _glob2 = _interopRequireDefault(_glob);

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _ramda = require("ramda");

var _ramda2 = _interopRequireDefault(_ramda);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new _bluebird2.default(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { _bluebird2.default.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } step("next"); }); }; }

var glob = _bluebird2.default.promisify(_glob2.default);
var readFile = _bluebird2.default.promisify(_fs2.default.readFile);
var readAndParse = _ramda2.default.composeP(JSON.parse, readFile);
var resourceOnly = function resourceOnly(filepath) {
    return filepath.replace("/package.json").replace(/\/[^\/]+$/, "");
};
var notModule = function notModule(filename) {
    return !filename.match(/node_modules/);
};

var pathAndSpec = _ramda2.default.curry((function () {
    var _this = this;

    var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(prefix, file) {
        var pathSpec, method, uri, spec;
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        _context.prev = 0;
                        _context.next = 3;
                        return readAndParse(file, "utf8");

                    case 3:
                        pathSpec = _context.sent;
                        method = _path2.default.basename(file.replace("/package.json", ""));
                        uri = resourceOnly(file).replace(prefix, "");
                        spec = {};

                        spec[method] = pathSpec["x-swagger-path"];
                        return _context.abrupt("return", _ramda2.default.assoc(uri, spec, {}));

                    case 11:
                        _context.prev = 11;
                        _context.t0 = _context["catch"](0);

                        console.error("Error parsing swagger config: " + file); // eslint-disable-line no-console
                        console.error(_context.t0.stack); // eslint-disable-line no-console
                        throw _context.t0;

                    case 16:
                    case "end":
                        return _context.stop();
                }
            }
        }, _callee, _this, [[0, 11]]);
    }));

    return function (_x, _x2) {
        return ref.apply(this, arguments);
    };
})());

var addPathToSwagger = function addPathToSwagger(swagger, pathSpecPair) {
    swagger.paths = _extends({}, swagger.paths, pathSpecPair);
    return swagger;
};

var build = (function () {
    var _this2 = this;

    var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(stage) {
        var swagger, files, data, spec;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        _context2.next = 2;
                        return readAndParse("swagger.json", "utf8");

                    case 2:
                        swagger = _context2.sent;
                        _context2.next = 5;
                        return glob("src/" + stage + "/**/package.json");

                    case 5:
                        files = _context2.sent;
                        _context2.next = 8;
                        return _bluebird2.default.all(_ramda2.default.map(pathAndSpec("src/" + stage), _ramda2.default.filter(notModule, files)));

                    case 8:
                        data = _context2.sent;

                        if (!swagger.paths) swagger.paths = {};
                        spec = _ramda2.default.reduce(addPathToSwagger, swagger, data);
                        return _context2.abrupt("return", spec);

                    case 12:
                    case "end":
                        return _context2.stop();
                }
            }
        }, _callee2, _this2);
    }));

    return function build(_x3) {
        return ref.apply(this, arguments);
    };
})();

exports.default = { build: build };
module.exports = exports['default'];
