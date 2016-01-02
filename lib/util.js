"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.subpaths = exports.removeLeadingSlash = exports.reduceAsync = exports.mapSerialAsync = exports.cmpObjProps = exports.cmpObj = exports.propNotEq = exports.notNil = exports.mapIndexed = exports.mapKeys = undefined;

var _ramda = require("ramda");

var _ramda2 = _interopRequireDefault(_ramda);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } step("next"); }); }; }

var mapKeys = exports.mapKeys = _ramda2.default.curry(function (fn, obj) {
    var keys = _ramda2.default.keys(obj);
    var vals = _ramda2.default.values(obj);
    return _ramda2.default.zipObj(_ramda2.default.map(fn, keys), vals);
});

var mapIndexed = exports.mapIndexed = _ramda2.default.addIndex(_ramda2.default.map);

var notNil = exports.notNil = _ramda2.default.compose(_ramda2.default.not, _ramda2.default.isNil);

var propNotEq = exports.propNotEq = _ramda2.default.curry(_ramda2.default.compose(_ramda2.default.not, _ramda2.default.propEq));

var cmpObj = exports.cmpObj = _ramda2.default.curry(function (a, b, prop) {
    return a[prop] === b[prop];
});

var cmpObjProps = exports.cmpObjProps = _ramda2.default.curry(function (props, a, b) {
    var vals = _ramda2.default.map(cmpObj(a, b), props);
    return _ramda2.default.all(_ramda2.default.equals(true), vals);
});

var mapSerialAsync = exports.mapSerialAsync = _ramda2.default.curry((function () {
    var _this = this;

    var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(fn, list) {
        var result, tail, results;
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        if (!(!list || list.length === 0)) {
                            _context.next = 2;
                            break;
                        }

                        return _context.abrupt("return", []);

                    case 2:
                        _context.next = 4;
                        return fn(_ramda2.default.head(list));

                    case 4:
                        result = _context.sent;
                        tail = _ramda2.default.tail(list);
                        results = [];

                        if (!(tail.length > 0)) {
                            _context.next = 14;
                            break;
                        }

                        _context.next = 10;
                        return mapSerialAsync(fn, tail);

                    case 10:
                        results = _context.sent;
                        return _context.abrupt("return", _ramda2.default.concat([result], results));

                    case 14:
                        return _context.abrupt("return", [result]);

                    case 15:
                    case "end":
                        return _context.stop();
                }
            }
        }, _callee, _this);
    }));

    return function (_x, _x2) {
        return ref.apply(this, arguments);
    };
})());

var reduceAsync = exports.reduceAsync = _ramda2.default.curry((function () {
    var _this2 = this;

    var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(fn, acc, list) {
        var tail;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        if (!_ramda2.default.isEmpty(list)) {
                            _context2.next = 2;
                            break;
                        }

                        return _context2.abrupt("return", acc);

                    case 2:
                        _context2.next = 4;
                        return fn(acc, _ramda2.default.head(list));

                    case 4:
                        acc = _context2.sent;
                        tail = _ramda2.default.tail(list);

                        if (!_ramda2.default.isEmpty(tail)) {
                            _context2.next = 10;
                            break;
                        }

                        return _context2.abrupt("return", acc);

                    case 10:
                        _context2.next = 12;
                        return reduceAsync(fn, acc, tail);

                    case 12:
                        return _context2.abrupt("return", _context2.sent);

                    case 13:
                    case "end":
                        return _context2.stop();
                }
            }
        }, _callee2, _this2);
    }));

    return function (_x3, _x4, _x5) {
        return ref.apply(this, arguments);
    };
})());

var removeLeadingSlash = exports.removeLeadingSlash = _ramda2.default.replace(/^\//, "");

var subpaths = exports.subpaths = function subpaths(paths) {
    var splitPath = _ramda2.default.compose(_ramda2.default.split("/"), removeLeadingSlash);

    var expander = _ramda2.default.reduce(function (paths, part) {
        var parts = _ramda2.default.filter(notNil, [_ramda2.default.last(paths), part]);
        var path = "/" + _ramda2.default.join("/", parts);
        var newPaths = _ramda2.default.append(path, paths);
        return newPaths;
    }, []);

    var expand = _ramda2.default.compose(_ramda2.default.sort(_ramda2.default.gt), _ramda2.default.uniq, _ramda2.default.map(_ramda2.default.replace(/^\/+/, "/")), _ramda2.default.flatten, _ramda2.default.map(expander), _ramda2.default.map(splitPath));

    return expand(paths);
};
