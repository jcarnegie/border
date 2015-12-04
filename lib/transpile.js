"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _this2 = this;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _bluebird = require("bluebird");

var _bluebird2 = _interopRequireDefault(_bluebird);

var _mkdirp = require("mkdirp");

var _mkdirp2 = _interopRequireDefault(_mkdirp);

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _glob = require("glob");

var _glob2 = _interopRequireDefault(_glob);

var _recursiveCopy = require("recursive-copy");

var _recursiveCopy2 = _interopRequireDefault(_recursiveCopy);

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _ramda = require("ramda");

var _ramda2 = _interopRequireDefault(_ramda);

var transformFile = require("./transformfile");

var writeFileSafe = function writeFileSafe(file, contents) {
    return new _bluebird2["default"](function (resolve, reject) {
        var dir = _path2["default"].dirname(file);
        (0, _mkdirp2["default"])(dir, function (err1) {
            _fs2["default"].writeFile(file, contents, function (err2) {
                if (err2) return reject(err2);
                resolve();
            });
        });
    });
};

exports["default"] = function callee$0$0(src, dest) {
    var nameTransformFn = arguments.length <= 2 || arguments[2] === undefined ? _ramda2["default"].identity : arguments[2];
    return regeneratorRuntime.async(function callee$0$0$(context$1$0) {
        var _this = this;

        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                return context$1$0.abrupt("return", new _bluebird2["default"](function (resolve, reject) {
                    (0, _glob2["default"])(src + "/**", { nodir: true }, function callee$2$0(err, files) {
                        var _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, prefixedFile, f, result, filename;

                        return regeneratorRuntime.async(function callee$2$0$(context$3$0) {
                            while (1) switch (context$3$0.prev = context$3$0.next) {
                                case 0:
                                    _iteratorNormalCompletion = true;
                                    _didIteratorError = false;
                                    _iteratorError = undefined;
                                    context$3$0.prev = 3;
                                    _iterator = files[Symbol.iterator]();

                                case 5:
                                    if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                                        context$3$0.next = 22;
                                        break;
                                    }

                                    prefixedFile = _step.value;
                                    f = prefixedFile.replace(src + "/", "");

                                    if (!f.match(/\.js$/)) {
                                        context$3$0.next = 17;
                                        break;
                                    }

                                    context$3$0.next = 11;
                                    return regeneratorRuntime.awrap(transformFile(prefixedFile));

                                case 11:
                                    result = context$3$0.sent;
                                    filename = nameTransformFn(dest + "/" + f);
                                    context$3$0.next = 15;
                                    return regeneratorRuntime.awrap(writeFileSafe(filename, result.code));

                                case 15:
                                    context$3$0.next = 19;
                                    break;

                                case 17:
                                    context$3$0.next = 19;
                                    return regeneratorRuntime.awrap((0, _recursiveCopy2["default"])(src + "/" + f, dest + "/" + f, { overwrite: true }));

                                case 19:
                                    _iteratorNormalCompletion = true;
                                    context$3$0.next = 5;
                                    break;

                                case 22:
                                    context$3$0.next = 28;
                                    break;

                                case 24:
                                    context$3$0.prev = 24;
                                    context$3$0.t0 = context$3$0["catch"](3);
                                    _didIteratorError = true;
                                    _iteratorError = context$3$0.t0;

                                case 28:
                                    context$3$0.prev = 28;
                                    context$3$0.prev = 29;

                                    if (!_iteratorNormalCompletion && _iterator["return"]) {
                                        _iterator["return"]();
                                    }

                                case 31:
                                    context$3$0.prev = 31;

                                    if (!_didIteratorError) {
                                        context$3$0.next = 34;
                                        break;
                                    }

                                    throw _iteratorError;

                                case 34:
                                    return context$3$0.finish(31);

                                case 35:
                                    return context$3$0.finish(28);

                                case 36:
                                    resolve();

                                case 37:
                                case "end":
                                    return context$3$0.stop();
                            }
                        }, null, _this, [[3, 24, 28, 36], [29,, 31, 35]]);
                    });
                }));

            case 1:
            case "end":
                return context$1$0.stop();
        }
    }, null, _this2);
};

module.exports = exports["default"];