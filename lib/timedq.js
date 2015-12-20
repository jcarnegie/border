"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _bluebird = require("bluebird");

var _bluebird2 = _interopRequireDefault(_bluebird);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

exports.default = function (fn, window) {
    var queue = [];
    var scheduled = false;

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

            var exec = function exec() {
                if (queue.length === 0) {
                    scheduled = false;
                } else {
                    var call = queue.shift();
                    fn.apply(undefined, _toConsumableArray(call.args)).then(call.resolve).catch(call.reject);
                    setTimeout(exec, window);
                }
            };

            if (!scheduled) {
                setTimeout(exec, 0);
                scheduled = true;
            }
        });
    };
};

module.exports = exports['default'];
