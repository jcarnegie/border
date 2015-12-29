import "babel-polyfill";
// import proxyquire from "proxyquire";
import sinon from "sinon";
// import chai from "chai";

// let expect = chai.expect;

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
        // let execStub = sinon.stub().returns({
        //     stdout: {},
        //     stderr: {},
        //     on: (event, cb) => {
        //         // if (event === "error") cb(0);
        //         if (event === "exit") cb(0);
        //     }
        // });
        //
        // let npmInstall = proxyquire("../../lib/npminstall", {
        //     child_process: { exec: execStub }
        // });
        //
        // await npmInstall("test");
        //
        // expect(execStub.withArgs("npm install").calledOnce).to.eql(true);
    });
});
