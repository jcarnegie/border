"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _bluebird = require("bluebird");

var _bluebird2 = _interopRequireDefault(_bluebird);

var _recursiveReaddir = require("recursive-readdir");

var _recursiveReaddir2 = _interopRequireDefault(_recursiveReaddir);

var _admZip = require("adm-zip");

var _admZip2 = _interopRequireDefault(_admZip);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (endpointDir) {
    var functionName = arguments.length <= 1 || arguments[1] === undefined ? "index" : arguments[1];

    return new _bluebird2.default(function (resolve) {
        var zip = new _admZip2.default();
        zip.addLocalFolder(endpointDir);
        resolve(zip.toBuffer());
    });
};