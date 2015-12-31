"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.integrationResponses = undefined;

var _ramda = require("ramda");

var _ramda2 = _interopRequireDefault(_ramda);

var _integrations = require("./integrations");

var _util = require("./util");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var integrationResponsesFull = _ramda2.default.compose(_ramda2.default.flatten, _ramda2.default.map(_ramda2.default.pathOr([], ["_embedded", "integration:responses"])), _ramda2.default.map((0, _util.propagate)("resourceMethod", ["_embedded", "integration:responses"])), _ramda2.default.map((0, _util.propagate)("path", ["_embedded", "integration:responses"])), _ramda2.default.map((0, _util.propagate)("id", ["_embedded", "integration:responses"])), _ramda2.default.map((0, _util.ensurePathArray)(["_embedded", "integration:responses"])), _integrations.integrationsFull);

var integrationResponses = exports.integrationResponses = _ramda2.default.compose(_ramda2.default.map(_ramda2.default.pick(["id", "path", "resourceMethod", "statusCode", "selectionPattern", "responseParameters", "responseTemplates"])), integrationResponsesFull);
