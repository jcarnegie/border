import "babel-polyfill";
import swagger from "../../lib/swagger";
import Promise from "bluebird";
import chai from "chai";
import fs from "fs";
import r from "ramda";

let expect = chai.expect;

let readFile = Promise.promisify(fs.readFile);
let readAndParse = r.composeP(JSON.parse, readFile);

describe("Swagger", () => {
    let cwd = null;

    beforeEach(() => {
        cwd = process.cwd();
        process.chdir("test/fixtures/swagger");
    });

    afterEach(() => {
        process.chdir(cwd);
    });

    it ("should build a JSON swagger spec", async () => {
        let spec       = await swagger.build("v1");
        let testSpec   = await readAndParse("swagger.json", "utf8");
        let pathSpec   = await readAndParse("src/v1/resource/get/package.json", "utf8");
        testSpec.paths = { "/resource": { get: pathSpec["x-swagger-path"]} };

        expect(spec).to.eql(testSpec);
    });
});
