import proxyquire from "proxyquire";
import existingApi from "./integrations-existing.json";
import swaggerApi from "./integrations-swagger.json";

describe("Update Methods", () => {
    let module = null;
    let update = null;
    let putIntegrationStub = null;
    let updateIntegrationStub = null;

    beforeEach(() => {
        putIntegrationStub = sinon.stub().yields(null, {});
        updateIntegrationStub = sinon.stub().yields(null, {});
        module = proxyquire("../../src/update/integrations", {
            "aws-sdk": {
                APIGateway: () => {
                    return {
                        putIntegration: putIntegrationStub,
                        updateIntegration: updateIntegrationStub
                    };
                }
            }
        });

        update = module.update;
    });

    it ("should create a new method", async () => {
        let putParams = {
            path: "/creates",
            httpMethod: "POST",
            integrationHttpMethod: "POST",
            type: "AWS",
            resourceId: "d1yazt",
            cacheNamespace: "d1yazt",
            restApiId: "abcdef",
            requestTemplates: {
                "application/json": '{"Host":"$input.params(\'Host\')","Connection":"$input.params(\'Connection\')","User-Agent":"$input.params(\'User-Agent\')","Accept":"$input.params(\'Accept\')","Referer":"$input.params(\'Referer\')","Accept-Encoding":"$input.params(\'Accept-Encoding\')","Accept-Language":"$input.params(\'Accept-Language\')","Pragma":"$input.params(\'Pragma\')","Authorization":"$input.params(\'Authorization\')","body":$input.json(\'$\')}'
            }
        };

        let updateParams = {
            httpMethod: "POST",
            resourceId: "meh8b3",
            restApiId: "abcdef",
            patchOperations: [
                {
                    op: "replace",
                    path: "/httpMethod",
                    value: "POST"
                },
                {
                    op: "replace",
                    path: "/uri",
                    value: null
                },
                {
                    op: "replace",
                    path: "/credentials",
                    value: null
                },
                {
                    op: "replace",
                    path: "/cacheNamespace",
                    value: "meh8b3"
                },
                {
                    op: "replace",
                    path: "/requestTemplates/application~1json",
                    value:  "{\"Host\":\"$input.params('Host')\",\"Connection\":\"$input.params('Connection')\",\"User-Agent\":\"$input.params('User-Agent')\",\"Accept\":\"$input.params('Accept')\",\"Referer\":\"$input.params('Referer')\",\"Accept-Encoding\":\"$input.params('Accept-Encoding')\",\"Accept-Language\":\"$input.params('Accept-Language')\",\"Pragma\":\"$input.params('Pragma')\",\"Foo\":\"$input.params('Foo')\",\"body\":$input.json('$')}"
                }
            ]
        };

        await update("abcdef", existingApi, swaggerApi);
        expect(putIntegrationStub.withArgs(putParams).calledOnce).to.eql(true);
        expect(updateIntegrationStub.withArgs(updateParams).calledOnce).to.eql(true);
    });
});
