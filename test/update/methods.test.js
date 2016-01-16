import proxyquire from "proxyquire";
import existingApi from "./methods-existing.json";
import swaggerApi from "./methods-swagger.json";

describe("Update Methods", () => {
    let module = null;
    let update = null;
    let putMethodStub = null;
    let updateMethodStub = null;

    beforeEach(() => {
        putMethodStub = sinon.stub().yields(null, {});
        updateMethodStub = sinon.stub().yields(null, {});
        module = proxyquire("../../src/update/methods", {
            "aws-sdk": {
                APIGateway: () => {
                    return {
                        putMethod: putMethodStub,
                        updateMethod: updateMethodStub
                    };
                }
            }
        });

        update = module.update;
    });

    it ("should create a new method", async () => {
        let putParams = {
            requestParameters: {
                "method.request.header.Host": true,
                "method.request.header.Connection": true,
                "method.request.header.User-Agent": true,
                "method.request.header.Accept": true,
                "method.request.header.Referer": true,
                "method.request.header.Accept-Encoding": true,
                "method.request.header.Accept-Language": true,
                "method.request.header.Pragma": true,
                "method.request.header.Authorization": true
            },
            authorizationType: "NONE",
            apiKeyRequired: false,
            httpMethod: "POST",
            resourceId: "d1yazt",
            restApiId: "abcdef"
        };

        let updateParams =  {
            httpMethod: "POST",
            resourceId: "meh8b3",
            restApiId: "abcdef",
            patchOperations: [
                {
                    op: "replace",
                    path: "/authorizationType",
                    value: "NONE"
                },
                {
                    op: "replace",
                    path: "/apiKeyRequired",
                    value: true
                },
                {
                    op: "add",
                    path: "/requestParameters/method.request.header.Foo"
                },
                {
                    op: "remove",
                    path: "/requestParameters/method.request.header.DeleteMe"
                }
            ]
        };

        await update("abcdef", existingApi, swaggerApi);
        expect(putMethodStub.withArgs(putParams).calledOnce).to.eql(true);
        expect(updateMethodStub.withArgs(updateParams).calledOnce).to.eql(true);
    });
});
