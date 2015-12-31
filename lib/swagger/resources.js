"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.resources = undefined;

var _ramda = require("ramda");

var _ramda2 = _interopRequireDefault(_ramda);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var resources = exports.resources = function resources(spec) {
    var assoc = _ramda2.default.flip(_ramda2.default.assoc("path"));
    return _ramda2.default.map(assoc({}), _ramda2.default.keys(spec.paths));
};
