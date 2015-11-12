import "babel/polyfill";
import proxyquire from "proxyquire";
import sinon from "sinon";
import pmock from "pmock";
import chai from "chai";

let expect = chai.expect;

describe("NPM Install", () => {
    let chdir = null;
    let chdirStub = null;

    beforeEach(() => {
        chdirStub = sinon.stub();
        chdir = process.chdir;
        process.chdir = chdirStub;
    });

    afterEach(() => {
        process.chdir = chdir;
    });

    it ("should install npm modules", async () => {
        let loadStub = sinon.stub().yields(null);
        let installStub = sinon.stub().yields(null, "foo");

        let npmInstall = proxyquire("../../lib/npminstall", {
            npm: {
                load: loadStub,
                commands: { install: installStub }
            }
        });

        await npmInstall("test");

        expect(loadStub.withArgs("test/package.json").calledOnce).to.eql(true);
        expect(installStub.calledOnce).to.eql(true);
        expect(chdirStub.calledTwice).to.eql(true);
    });
});
