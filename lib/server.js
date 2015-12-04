#!/usr/bin/env node
"use strict";

var _this = this;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _configure = require("./configure");

var _configure2 = _interopRequireDefault(_configure);

var _express = require("express");

var _express2 = _interopRequireDefault(_express);

var main = function main() {
    var app, stage, server;
    return regeneratorRuntime.async(function main$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                app = (0, _express2["default"])();
                stage = process.argv[2];
                context$1$0.next = 4;
                return regeneratorRuntime.awrap((0, _configure2["default"])(app, stage));

            case 4:
                server = app.listen(3000, function () {
                    var host = server.address().address;
                    var port = server.address().port;
                    console.log("API stage '" + stage + "' listening at http://%s:%s", host, port);
                });

            case 5:
            case "end":
                return context$1$0.stop();
        }
    }, null, _this);
};

main();