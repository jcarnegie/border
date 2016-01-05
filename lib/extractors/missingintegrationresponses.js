"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.missingIntegrationResponses = undefined;

var _ramda = require("ramda");

var _ramda2 = _interopRequireDefault(_ramda);

var _util = require("../util");

var _integrationresponses = require("./apigw/integrationresponses");

var _integrationresponses2 = require("./swagger/integrationresponses");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var missingIntegrationResponses = exports.missingIntegrationResponses = function missingIntegrationResponses(awsgwResourceData, swaggerSpec) {
    var apigwIntegrationResponses = (0, _integrationresponses.extract)(awsgwResourceData);
    var swaggerIntegrationResponses = (0, _integrationresponses2.extract)(swaggerSpec);
    var cmp = (0, _util.cmpObjProps)(["path", "resourceMethod", "statusCode", "selectionPattern"]);
    var integrationResponsesToAdd = _ramda2.default.differenceWith(cmp, swaggerIntegrationResponses, apigwIntegrationResponses);
    return integrationResponsesToAdd;
};
