/* eslint-disable */
var babel = require("babel-core");

var babelConfig = JSON.parse(require("fs").readFileSync(require("path").join(__dirname, ".babelrc")));
babelConfig.babel = babel;

module.exports = function (wallaby) {
    return {
        files: [
            "src/**/*.js",
            "test/lib/*.js",
            "test/fixtures/**"
        ],

        tests: [
            "test/**/*.test.js"
        ],

        compilers: {
            "**/*.js": wallaby.compilers.babel(babelConfig)
        },

        bootstrap: function() {
            require("babel-polyfill");
            require("./test/lib/helper");
        },

        env: {
            type: "node"
        }
    };
};
