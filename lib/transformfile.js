"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var Promise = require("bluebird");
var babel = require("babel-core");

var transformFile = Promise.promisify(babel.transformFile.bind(babel));

exports.default = transformFile;
module.exports = exports['default'];
