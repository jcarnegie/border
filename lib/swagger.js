"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _this = this;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

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

var glob = _bluebird2["default"].promisify(_glob2["default"]);
var readFile = _bluebird2["default"].promisify(_fs2["default"].readFile);
var readAndParse = _ramda2["default"].composeP(JSON.parse, readFile);
var resourceOnly = function resourceOnly(filepath) {
    return filepath.replace("/package.json").replace(/\/[^\/]+$/, "");
};
var notModule = function notModule(filename) {
    return !filename.match(/node_modules/);
};

var pathAndSpec = _ramda2["default"].curry(function callee$0$0(prefix, file) {
    var pathSpec, method, uri, spec;
    return regeneratorRuntime.async(function callee$0$0$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                context$1$0.prev = 0;
                context$1$0.next = 3;
                return regeneratorRuntime.awrap(readAndParse(file, "utf8"));

            case 3:
                pathSpec = context$1$0.sent;
                method = _path2["default"].basename(file.replace("/package.json", ""));
                uri = resourceOnly(file).replace(prefix, "");
                spec = {};

                spec[method] = pathSpec["x-swagger-path"];
                return context$1$0.abrupt("return", _ramda2["default"].assoc(uri, spec, {}));

            case 11:
                context$1$0.prev = 11;
                context$1$0.t0 = context$1$0["catch"](0);

                console.error("Error parsing swagger config: " + file);
                console.error(context$1$0.t0.stack);
                throw context$1$0.t0;

            case 16:
            case "end":
                return context$1$0.stop();
        }
    }, null, _this, [[0, 11]]);
});

var addPathToSwagger = function addPathToSwagger(swagger, pathSpecPair) {
    swagger.paths = _extends({}, swagger.paths, pathSpecPair);
    return swagger;
};

var build = function build(stage) {
    var swagger, files, data, spec;
    return regeneratorRuntime.async(function build$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                context$1$0.next = 2;
                return regeneratorRuntime.awrap(readAndParse("swagger.json", "utf8"));

            case 2:
                swagger = context$1$0.sent;
                context$1$0.next = 5;
                return regeneratorRuntime.awrap(glob("src/" + stage + "/**/package.json"));

            case 5:
                files = context$1$0.sent;
                context$1$0.next = 8;
                return regeneratorRuntime.awrap(_bluebird2["default"].all(_ramda2["default"].map(pathAndSpec("src/" + stage), _ramda2["default"].filter(notModule, files))));

            case 8:
                data = context$1$0.sent;

                if (!swagger.paths) swagger.paths = {};
                spec = _ramda2["default"].reduce(addPathToSwagger, swagger, data);
                return context$1$0.abrupt("return", spec);

            case 12:
            case "end":
                return context$1$0.stop();
        }
    }, null, _this);
};

exports["default"] = { build: build };
module.exports = exports["default"];