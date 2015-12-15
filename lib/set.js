"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

exports.default = {
    union: function union(a, b) {
        return new Set([].concat(_toConsumableArray(a), _toConsumableArray(b)));
    },

    intersection: function intersection(a, b) {
        return new Set([].concat(_toConsumableArray(a)).filter(function (x) {
            return b.has(x);
        }));
    },

    difference: function difference(a, b) {
        return new Set([].concat(_toConsumableArray(a)).filter(function (x) {
            return !b.has(x);
        }));
    }
};
module.exports = exports['default'];
