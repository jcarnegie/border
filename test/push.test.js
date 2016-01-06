import proxyquire from "proxyquire";
import gw from "../src/gateway";

describe ("Push", () => {
    let pushModule = null;
    let region = null;
    let apiId = null;
    let embeddedResourcesStub = null;
    let swaggerBuildStub = null;
    let createResourcesStub = null;
    let createMethodsStub = null;
    let createIntegrationsStub = null;

    describe ("New", () => {
        beforeEach(async () => {
            let swaggerSpec = require("./fixtures/push/new.swagger.json");

            region = "us-west-2";
            apiId = "abcdefg";

            embeddedResourcesStub = sinon.stub().resolves([]);
            swaggerBuildStub = sinon.stub().resolves(swaggerSpec);
            createResourcesStub = sinon.stub();
            createMethodsStub = sinon.stub();
            createIntegrationsStub = sinon.stub();

            pushModule = proxyquire("../src/push", {
                "./apigateway": {
                    embeddedResources: embeddedResourcesStub
                },
                "./swagger": {
                    build: swaggerBuildStub
                },
                "./createresources": {
                    createResources: createResourcesStub
                },
                "./createmethods": {
                    createMethods: createMethodsStub
                },
                "./createintegrations": {
                    createIntegrations: createIntegrationsStub
                }
            });

            await pushModule.push(region, apiId, "v1");

            expect(embeddedResourcesStub.calledOnce).to.eql(true);
            expect(swaggerBuildStub.calledOnce).to.eql(true);
        });

        it ("it should push new resources", async () => {
            let args = [region, apiId, [], ["/auth", "/auth/session"]];
            expect(createResourcesStub.withArgs(...args).calledOnce).to.eql(true);
        });

        it ("should push new methods", async () => {
            let methodSpecs = [{
                requestParameters: {
                    "method.request.header.Host": true,
                    "method.request.header.Connection": true,
                    "method.request.header.User-Agent": true,
                    "method.request.header.Accept": true,
                    "method.request.header.Referer": true,
                    "method.request.header.Accept-Encoding": true,
                    "method.request.header.Accept-Language": true,
                    "method.request.header.Pragma": true
                },
                authorizationType: "NONE",
                apiKeyRequired: true,
                path: "/auth/session",
                httpMethod: "POST",
                "x-aws-apigateway": {
                    apiKeyRequired: true
                },
                restApiId: "abcdefg"
            }];
            let args = [sinon.match.object, [], methodSpecs];
            expect(createMethodsStub.withArgs(...args).calledOnce).to.eql(true);
        });

        it ("should push new integrations", () => {
            let integrationSpecs = [{
                requestParameters: {
                    "method.request.header.Host": true,
                    "method.request.header.Connection": true,
                    "method.request.header.User-Agent": true,
                    "method.request.header.Accept": true,
                    "method.request.header.Referer": true,
                    "method.request.header.Accept-Encoding": true,
                    "method.request.header.Accept-Language": true,
                    "method.request.header.Pragma": true
                },
                authorizationType: "NONE",
                apiKeyRequired: true,
                path: "/auth/session",
                "x-aws-apigateway": {
                    apiKeyRequired: true
                },
                resourceMethod: "POST",
                httpMethod: "POST",
                type: "AWS",
                restApiId: "abcdefg"
            }];
            let args = [sinon.match.object, [], integrationSpecs];
            expect(createIntegrationsStub.withArgs(...args).calledOnce).to.eql(true);
        });

        it ("should push new integration responses");
        it ("should push new responses");
    });

    describe("Updated", () => {
        beforeEach(() => {

        });

        it ("should push updated methods");
        it ("should push updated integrations");
        it ("should push updated integration responses");
        it ("should push updated responses");
    });
});
