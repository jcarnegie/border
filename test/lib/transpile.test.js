import "babel-polyfill";
import asyncTest from "../asynctest";
import proxyquire from "proxyquire";
import sinon from "sinon";
import "sinon-as-promised";
import chai from "chai";
import r from "ramda";

let expect = chai.expect;

describe("Transpile", () => {
    it ("should transpile and/or copy files", asyncTest(async () => {
        let globStub = sinon.stub().yields(null, ["foo", "bar", "hello/get/index.js"]);
        let copyStub = sinon.stub();
        let mkdirStub = sinon.stub().yields(null);
        let transformStub = sinon.stub().resolves({ code: "code" });
        let writeFileStub = sinon.stub().yields(null);

        let transpile = proxyquire("../../lib/transpile", {
            glob: globStub,
            mkdirp: mkdirStub,
            "./transformfile": transformStub,
            fs: { writeFile: writeFileStub },
            "recursive-copy": copyStub
        });

        await transpile("src", "dest", r.identity);

        expect(globStub.withArgs("src/**", { nodir: true, follow: true }).calledOnce).to.eql(true);
        expect(transformStub.withArgs("hello/get/index.js").calledOnce).to.eql(true);
        expect(writeFileStub.withArgs("dest/hello/get/index.js", "code").calledOnce).to.eql(true);
        expect(copyStub.calledTwice).to.eql(true);
        expect(mkdirStub.calledOnce).to.eql(true);
    }));
});
