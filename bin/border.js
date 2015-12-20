#!/usr/bin/env node
"use strict";

require("babel-polyfill");

var _commander = require("commander");

var _commander2 = _interopRequireDefault(_commander);

var _deploy = require("../lib/actions/deploy");

var _deploy2 = _interopRequireDefault(_deploy);

var _build = require("../lib/actions/build");

var _build2 = _interopRequireDefault(_build);

var _dev = require("../lib/actions/dev");

var _dev2 = _interopRequireDefault(_dev);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_commander2.default.command("deploy <stage>").action(_deploy2.default);

_commander2.default.command("build <stage>").action(_build2.default);

_commander2.default.command("dev <stage>").action(_dev2.default);

_commander2.default.parse(process.argv);
