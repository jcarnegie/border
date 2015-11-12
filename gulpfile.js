/* global require process console */
var fs          = require("fs");
var gulp        = require("gulp");
var sourcemaps  = require("gulp-sourcemaps");
var babel       = require("gulp-babel");
var watch       = require("gulp-watch");
var mocha       = require("gulp-mocha");
var eslint      = require("gulp-eslint");
var istanbul    = require("gulp-babel-istanbul");
var reduce      = require("gulp-reduce-file");
var mergeStream = require("merge-stream");
var mapStream   = require("map-stream");
var request     = require("superagent");
var https       = require("https");
var aws4        = require("aws4");
var r           = require("ramda");

var MIN_COVERAGE_PERCENTAGE = 90;
var COVERAGE_REPORTERS = ["lcov", "json", "text", "text-summary", "clover"];

var fileToJson = function(path) {
    var contents = fs.readFileSync(path, "utf8");
    return JSON.parse(contents);
}

// since our tests are written in es6/7 and transpiled with babel
require("babel-core/register");

gulp.task("default", ["build"]);

gulp.task("swagger", function() {
    var memo = null;
    var collect = function(file, memo) {
        var details = JSON.parse(file._contents.toString());
        var uri = file.history[0]
            .replace(file.base, "")
            .replace("/swagger.json", "");
        var method = uri.match(/[^\/]+$/);
        uri = "/" + uri.replace(/\/[^\/]+$/, "");
        if (!memo[uri]) memo[uri] = {};
        memo[uri][method] = details;
        return memo;
    }

    var end = function(memo) {
        var swagger = fileToJson("swagger.json");
        swagger.paths = memo;
        return swagger;
    }

    gulp.src("src/**/swagger.json")
        .pipe(reduce("swagger.json", collect, end, {}))
        .pipe(gulp.dest("dist"));
});

gulp.task("build", function () {
    return gulp.src("src/**/*.js")
        .pipe(sourcemaps.init())
        .pipe(babel({ stage: 0 }))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest("dist"));
});

gulp.task("dev", function () {
    return gulp.src("src/**/*.js")
        .pipe(watch("src/**/*.js"))
        .pipe(sourcemaps.init())
        .pipe(babel({ stage: 0 }))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest("lib"));
});

gulp.task("test", function() {
    return gulp.src("test/**/*.test.js")
        .pipe(mapStream(function(file, cb) {
            console.log(file.path);
            cb(null, file);
        }))
        .pipe(mocha())
        .once("error", function (e) { console.log(e.stack); process.exit(1); }) // eslint-disable-line no-console
        .once("end", function () { process.exit(); });
});

gulp.task("coverage", function() {
    mergeStream(
        gulp.src(["src/**/*.js"])
            .pipe(istanbul()),
        gulp.src(["test/**/*.test.js"])
        .pipe(babel())
    ).pipe(istanbul.hookRequire())
        .on("finish", function () {
            gulp.src(["test/**/*.test.js"])
                .pipe(mocha())
                // Creating the reports after tests ran
                .pipe(istanbul.writeReports({ reporters: COVERAGE_REPORTERS }))
                // FAIL unless coverage >= MIN_COVERAGE_PERCENTAGE
                .pipe(istanbul.enforceThresholds({ thresholds: { global: MIN_COVERAGE_PERCENTAGE } })) // Enforce a coverage of at least 90%
                .once("error", function () { console.log("ERROR: Code coverage below " + MIN_COVERAGE_PERCENTAGE + "%"); process.exit(1); }) // eslint-disable-line no-console
                .once("end", function() { process.exit(); });
        });
});

gulp.task("lint", function() {
    return gulp.src(["src/**/*.js", "test/**/*.js"])
        .pipe(eslint())
        .pipe(eslint.formatEach())
        .pipe(eslint.failOnError());
});

gulp.task("deploy", function(done) {
    // var url = "https://apigateway.us-east-1.amazonaws.com";
    // request.get(url)
    //     .set("Host", url)
    //     .set("Date", new Date().toISOString())
    //     .set("")

    var signed = aws4.sign({
        host: "apigateway.us-west-2.amazonaws.com",
        service: "apigateway",
        region: "us-west-2",
        method: "GET",
        path: "/restapis"
    });

    console.log(signed);

    var req = https.request(signed, function(res) {
        res.pipe(process.stdout);
        done();
    });

    req.on("error", function(e) {
        console.error(e);
    });

    req.end();
});
