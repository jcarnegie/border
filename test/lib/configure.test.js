import proxyquire from "proxyquire";
import sinon from "sinon";
import chai from "chai";

let expect = chai.expect;

describe("App", () => {
    it ("should create an express app server", async () => {
        let stage = "v1";
        let globStub = sinon.stub().yields(null, [
            `src/${stage}/hello/get/package.json`
        ]);
        let getStub = sinon.stub();
        let app = proxyquire("../../lib/configure", {
            glob: globStub,
            "../src/v1/hello/get": { handler: () => {} }
        });

        await app({ get: getStub }, stage);

        expect(globStub.calledOnce).to.eql(true);
        expect(getStub.withArgs("/hello").calledOnce).to.eql(true);
    });
});
