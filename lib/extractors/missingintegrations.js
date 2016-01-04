"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.missingIntegrations = undefined;

var _ramda = require("ramda");

var _ramda2 = _interopRequireDefault(_ramda);

var _util = require("../util");

var _integrations = require("./apigw/integrations");

var _integrations2 = require("./swagger/integrations");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var missingIntegrations = exports.missingIntegrations = function missingIntegrations(awsgwResourceData, swaggerSpec) {
    var apigwIntegrations = (0, _integrations.extract)(awsgwResourceData);
    var swaggerIntegrations = (0, _integrations2.extract)(swaggerSpec);
    var cmp = (0, _util.cmpObjProps)(["path", "httpMethod"]);
    var integrationsToAdd = _ramda2.default.differenceWith(cmp, swaggerIntegrations, apigwIntegrations);
    return integrationsToAdd;
};
