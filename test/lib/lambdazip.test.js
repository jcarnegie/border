import "babel/polyfill";
import proxyquire from "proxyquire";
import sinon from "sinon";
import chai from "chai";
import readdir from "recursive-readdir";

let expect = chai.expect;

describe("Lambda Function Zip", () => {
    it ("should return a buffer", async () => {
        let readdirStub = sinon.stub().yields(null, ["foo", "bar"]);
        let zipAddLocalFileStub = sinon.stub();
        let zipWriteStub = sinon.stub().returns(new Buffer("lambdazip"));

        let lambdazip = proxyquire("../../lib/lambdazip", {
            "recursive-readdir": readdirStub,
            "adm-zip": function() {
                this.addLocalFile = zipAddLocalFileStub;
                this.writeZip = zipWriteStub;
            }
        });

        let funcDir = "/some/lambda/func/dir";
        let modDirs = `${funcDir}/node_modules`;
        let buffer = await lambdazip(funcDir);

        expect(readdirStub.withArgs(modDirs).calledOnce).to.eql(true);
        expect(zipAddLocalFileStub.getCall(0).args[0]).to.eql(`${funcDir}/index.js`);
        expect(zipAddLocalFileStub.getCall(1).args[0]).to.eql(`${funcDir}/package.json`);
        expect(zipAddLocalFileStub.getCall(2).args[0]).to.eql("foo");
        expect(zipAddLocalFileStub.getCall(3).args[0]).to.eql("bar");
        expect(buffer.toString()).eql("lambdazip");
    });
});
