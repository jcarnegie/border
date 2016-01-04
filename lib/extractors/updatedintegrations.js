"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.updatedIntegrations = undefined;

var _ramda = require("ramda");

var _ramda2 = _interopRequireDefault(_ramda);

var _util = require("../util");

var _integrations = require("./apigw/integrations");

var _integrations2 = require("./swagger/integrations");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var COMPARE_PROPS = ["path", "resourceMethod", "httpMethod", "type"];

var updatedIntegrations = exports.updatedIntegrations = function updatedIntegrations(awsgwResourceData, swaggerSpec) {
    var apigwIntegrations = (0, _integrations.extract)(awsgwResourceData);
    var swaggerIntegrations = (0, _integrations2.extract)(swaggerSpec);
    var cmp = (0, _util.cmpObjProps)(COMPARE_PROPS);
    var integrationsToUpdate = _ramda2.default.differenceWith(cmp, swaggerIntegrations, apigwIntegrations);
    return integrationsToUpdate;
};
