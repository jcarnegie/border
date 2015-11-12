import "babel/polyfill";
import asyncTest from "../asynctest";
import proxyquire from "proxyquire";
import sinon from "sinon";
import "sinon-as-promised";
import chai from "chai";

let expect = chai.expect;

describe("Transpile", () => {
    it ("should transpile and/or copy files", asyncTest(async () => {
        let globStub = sinon.stub().yields(null, ["foo", "bar", "hello/get/index.js"]);
        let copyStub = sinon.stub();
        let transformStub = sinon.stub().resolves({ code: "code" });
        let writeFileStub = sinon.stub().yields(null);

        let transpile = proxyquire("../../lib/transpile", {
            glob: globStub,
            "../notranspile/transformfile": transformStub,
            fs: { writeFile: writeFileStub },
            "recursive-copy": copyStub
        });

        await transpile("test", "v1", "src", "dest");

        expect(globStub.withArgs("src/**").calledOnce).to.eql(true);
        expect(transformStub.withArgs("src/hello/get/index.js").calledOnce).to.eql(true);
        expect(writeFileStub.withArgs("dest/hello/get/test-v1-hello-get.js", "code").calledOnce).to.eql(true);
        expect(copyStub.calledTwice).to.eql(true);
    }));
});
