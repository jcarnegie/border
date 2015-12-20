"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.color = undefined;

require("colors");

var color = exports.color = function color(str) {
    switch (str) {
        case "ok":
            return str.green;
        case "warn":
        case "warning":
            return str.yellow;
        case "err":
        case "error":
            return str.red;
        case "fatal":
            return str.black;
        default:
            return str;
    }
};
