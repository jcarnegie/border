var babel = require("babel");

module.exports = function (wallaby) {
    return {
        debug: true,

        testFramework: "mocha@2.1.0",

        files: [
            "src/**/*.js",
            "lib/**/*.js",
            "tasks/**/*.js"
        ],
        tests: [
            "test/**/*.test.js",
            "test/*.js",
            "test/fixtures/**",
        ],
        env: {
            type: "node",
        },
        compilers: {
            "**/*.js": wallaby.compilers.babel({
                babel: babel,
                // other babel options
                stage: 0    // https://babeljs.io/docs/usage/experimental/
            })
        }
    }
}
