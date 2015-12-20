"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.logger = undefined;

var _colors = require("./colors");

var logger = exports.logger = function logger(level, msg) {
    console.log("[" + (0, _colors.color)(level) + "] " + msg); // eslint-disable-line no-console
};
