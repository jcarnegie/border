"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.extract = undefined;

var _ramda = require("ramda");

var _ramda2 = _interopRequireDefault(_ramda);

var _methods = require("./methods");

var _util = require("./util");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var PROPS = ["id", "path", "resourceMethod", "statusCode", "responseModels", "responseParameters"];

var extractResponses = _ramda2.default.compose(_ramda2.default.map((0, _util.setIf)((0, _util.propIsNil)("responseParameters"), "responseParameters", {})), _ramda2.default.map((0, _util.setIf)((0, _util.propIsNil)("responseModels"), "responseModels", {})), _ramda2.default.flatten, _ramda2.default.map(_ramda2.default.pathOr([], ["_embedded", "method:responses"])), _ramda2.default.map((0, _util.propagateAs)("httpMethod", "resourceMethod", ["_embedded", "method:responses"])), _ramda2.default.map((0, _util.propagate)("path", ["_embedded", "method:responses"])), _ramda2.default.map((0, _util.propagate)("id", ["_embedded", "method:responses"])), _ramda2.default.map((0, _util.ensurePathArray)(["_embedded", "method:responses"])), _methods.extractMethods);

var extract = exports.extract = _ramda2.default.compose(_ramda2.default.map(_ramda2.default.pick(PROPS)), extractResponses);
