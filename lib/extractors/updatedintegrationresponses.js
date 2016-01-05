"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.updatedIntegrationResponses = undefined;

var _ramda = require("ramda");

var _ramda2 = _interopRequireDefault(_ramda);

var _util = require("../util");

var _integrationresponses = require("./apigw/integrationresponses");

var _integrationresponses2 = require("./swagger/integrationresponses");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ID_PROPS = ["path", "resourceMethod", "statusCode"];

var COMPARE_PROPS = _ramda2.default.append("selectionPattern", ID_PROPS);

/**
 * Comparing:
 *
 * 1. DON'T include newly added items for update
 * 2.
 */

var updatedIntegrationResponses = exports.updatedIntegrationResponses = function updatedIntegrationResponses(awsgwResourceData, swaggerSpec) {
    var apigwIntegrationResponses = (0, _integrationresponses.extract)(awsgwResourceData);
    var swaggerIntegrationResponses = (0, _integrationresponses2.extract)(swaggerSpec);
    var integrationResponsesToUpdate = (0, _util.updatedSetElements)((0, _util.cmpObjProps)(ID_PROPS), (0, _util.cmpObjProps)(COMPARE_PROPS), apigwIntegrationResponses, swaggerIntegrationResponses);
    return integrationResponsesToUpdate;
};
