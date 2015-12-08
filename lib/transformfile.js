"use strict";

var Promise = require("bluebird");
var babel = require("babel-core");

module.exports = function (file) {
    return new Promise(function (resolve, reject) {
        babel.transformFile(file, function (err, result) {
            if (err) return reject(err);
            resolve(result);
        });
    });
};