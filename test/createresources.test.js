import r from "ramda";
import proxyquire from "proxyquire";

describe ("Create API GW Resources", () => {
    let module = null;
    let createResourceStub = null;
    let region = null;
    let apiId = null;
    let resources = null;
    let path = null;

    beforeEach(() => {
        path = "/users";
        createResourceStub = sinon.stub();
        module = proxyquire("../src/createresources", {
            "./apigateway": {
                createResource: createResourceStub.resolves({
                    id: "xyz",
                    path
                })
            }
        });
        region = "us-west-2";
        apiId = "xyz";
        resources = [{ id: "abc", path: "/" }];
    });

    it ("should create a new resource", async () => {
        let result = await module.createResources(region, apiId, resources, ["/users"]);
        expect(result).to.eql(r.append({ id: "xyz", path }, resources));
        expect(createResourceStub.calledOnce).to.eql(true);
    });
});
