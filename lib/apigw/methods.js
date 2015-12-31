"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.methods = exports.methodsFull = undefined;

var _ramda = require("ramda");

var _ramda2 = _interopRequireDefault(_ramda);

var _util = require("./util");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var methodsFull = exports.methodsFull = _ramda2.default.compose(_ramda2.default.flatten, _ramda2.default.map(_ramda2.default.pathOr([], ["_embedded", "resource:methods"])), _ramda2.default.map((0, _util.propagate)("path", ["_embedded", "resource:methods"])), _ramda2.default.map((0, _util.propagate)("id", ["_embedded", "resource:methods"])), _ramda2.default.map((0, _util.ensurePathArray)(["_embedded", "resource:methods"])));

var methods = exports.methods = _ramda2.default.compose(_ramda2.default.map(_ramda2.default.pick(["id", "path", "apiKeyRequired", "authorizationType", "httpMethod", "requestParameters", "requestModels"])), methodsFull);
