"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.integrations = exports.integrationsFull = undefined;

var _ramda = require("ramda");

var _ramda2 = _interopRequireDefault(_ramda);

var _methods = require("./methods");

var _util = require("./util");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var integrationsFull = exports.integrationsFull = _ramda2.default.compose(_ramda2.default.flatten, _ramda2.default.map(_ramda2.default.pathOr([], ["_embedded", "method:integration"])), _ramda2.default.map((0, _util.propagateAs)("httpMethod", "resourceMethod", ["_embedded", "method:integration"])), _ramda2.default.map((0, _util.propagate)("path", ["_embedded", "method:integration"])), _ramda2.default.map((0, _util.propagate)("id", ["_embedded", "method:integration"])), _ramda2.default.map((0, _util.ensurePathArray)(["_embedded", "method:integration"])), _methods.methodsFull);

var integrations = exports.integrations = _ramda2.default.compose(_ramda2.default.map(_ramda2.default.pick(["id", "path", "resourceMethod", "cacheKeyParameters", "cacheNamespace", "httpMethod", "type", "uri"])), integrationsFull);
