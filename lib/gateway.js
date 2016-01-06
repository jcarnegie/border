"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.gatewayMethods = undefined;

var _ramda = require("ramda");

var _ramda2 = _interopRequireDefault(_ramda);

var _awsSdk = require("aws-sdk");

var _awsSdk2 = _interopRequireDefault(_awsSdk);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var gatewayMethods = exports.gatewayMethods = function gatewayMethods(region) {
    var api = new _awsSdk2.default.APIGateway({ region: region });

    var methods = ["createResource", "putMethod", "updateMethod", "putMethodResponse", "updateMethodResponse"];

    var addMethod = _ramda2.default.curry(function (api, methods, method) {
        methods[method] = api[method].bind(api);
        return methods;
    });

    return _ramda2.default.reduce(addMethod(api), {}, methods);
};
