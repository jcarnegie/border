"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.ensurePathArray = exports.propagateAs = exports.propagate = exports.assocPath = exports.pathExists = undefined;

var _ramda = require("ramda");

var _ramda2 = _interopRequireDefault(_ramda);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var pathExists = exports.pathExists = function pathExists(path, obj) {
    return _ramda2.default.not(_ramda2.default.isNil(_ramda2.default.path(path, obj)));
};

var assocPath = exports.assocPath = _ramda2.default.curry(function (path, val, obj) {
    var clone = _ramda2.default.clone(obj);
    _ramda2.default.reduce(function (parts, part) {
        var currentParts = _ramda2.default.append(part, parts);
        clone = _ramda2.default.assocPath(currentParts, {}, clone);
        return currentParts;
    }, [], _ramda2.default.init(path));
    return _ramda2.default.assocPath(path, val, clone);
});

var propagate = exports.propagate = _ramda2.default.curry(function (prop, path, obj) {
    return propagateAs(prop, prop, path, obj);
});

var propagateAs = exports.propagateAs = _ramda2.default.curry(function (prop, destProp, path, obj) {
    if (_ramda2.default.not(pathExists(path, obj))) return obj;
    var clone = _ramda2.default.clone(obj);
    var assoc = function assoc(val) {
        return _ramda2.default.assoc(destProp, clone[prop], val);
    };
    var values = _ramda2.default.map(assoc, _ramda2.default.pathOr([], path, clone));
    return assocPath(path, values, clone);
});

var ensurePathArray = exports.ensurePathArray = _ramda2.default.curry(function (path, obj) {
    if (_ramda2.default.not(pathExists(path, obj))) return obj;
    var val = _ramda2.default.path(path, obj);
    return _ramda2.default.assocPath(path, _ramda2.default.is(Array, val) ? val : [val], obj);
});
