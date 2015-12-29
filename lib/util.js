"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.notNil = exports.mapIndexed = exports.mapKeys = undefined;

var _ramda = require("ramda");

var _ramda2 = _interopRequireDefault(_ramda);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var mapKeys = exports.mapKeys = _ramda2.default.curry(function (fn, obj) {
    var keys = _ramda2.default.keys(obj);
    var vals = _ramda2.default.values(obj);
    return _ramda2.default.zipObj(_ramda2.default.map(fn, keys), vals);
});

var mapIndexed = exports.mapIndexed = _ramda2.default.addIndex(_ramda2.default.map);

var notNil = exports.notNil = _ramda2.default.compose(_ramda2.default.not, _ramda2.default.isNil);
