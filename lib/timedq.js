"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _bluebird = require("bluebird");

var _bluebird2 = _interopRequireDefault(_bluebird);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var time = function time() {
    return new Date().getTime();
};

exports.default = function (fn, window) {
    var queue = [];
    var last = null;

    return function () {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return new _bluebird2.default(function (resolve, reject) {
            queue.push({
                resolve: resolve,
                reject: reject,
                args: [].concat(args)
            });

            var schedule = function schedule() {
                var now = time();
                var next = last === null ? 0 : window + last - now;
                if (next < 0) next = 0;
                last = now;
                setTimeout(exec, next);
            };

            var exec = function exec() {
                if (queue.length === 0) return;

                var call = queue.shift();
                var p = fn.apply(undefined, _toConsumableArray(call.args));
                p.then(call.resolve);
                p.catch(call.reject);

                schedule();
            };

            schedule();
        });
    };
};

module.exports = exports['default'];
