"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.extract = exports.extractIntegrationResponses = undefined;

var _ramda = require("ramda");

var _ramda2 = _interopRequireDefault(_ramda);

var _integrations = require("./integrations");

var _util = require("./util");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var PROPS = ["id", "path", "resourceMethod", "statusCode", "selectionPattern", "responseParameters", "responseTemplates"];

var setIf = _ramda2.default.curry(function (pred, prop, val, obj) {
    if (pred(obj)) {
        return _ramda2.default.assoc(prop, val, obj);
    } else {
        return obj;
    }
});

var extractIntegrationResponses = exports.extractIntegrationResponses = _ramda2.default.compose(_ramda2.default.flatten, _ramda2.default.map(_ramda2.default.pathOr([], ["_embedded", "integration:responses"])), _ramda2.default.map((0, _util.propagate)("resourceMethod", ["_embedded", "integration:responses"])), _ramda2.default.map((0, _util.propagate)("path", ["_embedded", "integration:responses"])), _ramda2.default.map((0, _util.propagate)("id", ["_embedded", "integration:responses"])), _ramda2.default.map((0, _util.ensurePathArray)(["_embedded", "integration:responses"])), _integrations.extractIntegrations);

var extract = exports.extract = _ramda2.default.compose(_ramda2.default.map(_ramda2.default.pick(PROPS)), _ramda2.default.map(setIf(_ramda2.default.propEq("selectionPattern", undefined), "selectionPattern", null)), // eslint-disable-line
extractIntegrationResponses);
