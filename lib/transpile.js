"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new _bluebird2.default(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { _bluebird2.default.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } step("next"); }); }; }

var transformFile = require("./transformfile");

var writeFileSafe = function writeFileSafe(file, contents) {
    return new _bluebird2.default(function (resolve, reject) {
        var dir = _path2.default.dirname(file);
        (0, _mkdirp2.default)(dir, function () {
            _fs2.default.writeFile(file, contents, function (err) {
                if (err) return reject(err);
                resolve();
            });
        });
    });
};

exports.default = (function () {
    var _this2 = this;

    var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(src, dest, nameTransformFn) {
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        return _context2.abrupt("return", new _bluebird2.default(function (resolve) {
                            (0, _glob2.default)(src + "/**", { nodir: true, follow: true }, (function () {
                                var _this = this;

                                var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(err, files) {
                                    var _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, prefixedFile, file, result, filename;

                                    return regeneratorRuntime.wrap(function _callee$(_context) {
                                        while (1) {
                                            switch (_context.prev = _context.next) {
                                                case 0:
                                                    _iteratorNormalCompletion = true;
                                                    _didIteratorError = false;
                                                    _iteratorError = undefined;
                                                    _context.prev = 3;
                                                    _iterator = files[Symbol.iterator]();

                                                case 5:
                                                    if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                                                        _context.next = 22;
                                                        break;
                                                    }

                                                    prefixedFile = _step.value;
                                                    file = prefixedFile.replace(src + "/", "");

                                                    if (!file.match(/\.js$/)) {
                                                        _context.next = 17;
                                                        break;
                                                    }

                                                    _context.next = 11;
                                                    return transformFile(prefixedFile);

                                                case 11:
                                                    result = _context.sent;
                                                    filename = nameTransformFn(dest + "/" + file);
                                                    _context.next = 15;
                                                    return writeFileSafe(filename, result.code);

                                                case 15:
                                                    _context.next = 19;
                                                    break;

                                                case 17:
                                                    _context.next = 19;
                                                    return (0, _recursiveCopy2.default)(src + "/" + file, dest + "/" + file, { overwrite: true });

                                                case 19:
                                                    _iteratorNormalCompletion = true;
                                                    _context.next = 5;
                                                    break;

                                                case 22:
                                                    _context.next = 28;
                                                    break;

                                                case 24:
                                                    _context.prev = 24;
                                                    _context.t0 = _context["catch"](3);
                                                    _didIteratorError = true;
                                                    _iteratorError = _context.t0;

                                                case 28:
                                                    _context.prev = 28;
                                                    _context.prev = 29;

                                                    if (!_iteratorNormalCompletion && _iterator.return) {
                                                        _iterator.return();
                                                    }

                                                case 31:
                                                    _context.prev = 31;

                                                    if (!_didIteratorError) {
                                                        _context.next = 34;
                                                        break;
                                                    }

                                                    throw _iteratorError;

                                                case 34:
                                                    return _context.finish(31);

                                                case 35:
                                                    return _context.finish(28);

                                                case 36:
                                                    resolve();

                                                case 37:
                                                case "end":
                                                    return _context.stop();
                                            }
                                        }
                                    }, _callee, _this, [[3, 24, 28, 36], [29,, 31, 35]]);
                                }));

                                return function (_x4, _x5) {
                                    return ref.apply(this, arguments);
                                };
                            })());
                        }));

                    case 1:
                    case "end":
                        return _context2.stop();
                }
            }
        }, _callee2, _this2);
    }));

    return function (_x, _x2, _x3) {
        return ref.apply(this, arguments);
    };
})();

module.exports = exports['default'];
