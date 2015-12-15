/* eslint-disable object-shorthand */

import "babel-polyfill";
import proxyquire from "proxyquire";
import asyncTest from "../asynctest";
import Bluebird from "bluebird";
import sinon from "sinon";
import chai from "chai";
import sap from "sinon-as-promised";
import fs from "fs";

sap(Bluebird);

let expect = chai.expect;

let loadFixture = (name) => {
    let file = `test/fixtures/${name}.json`;
    let contents = fs.readFileSync(file, "utf8");
    return JSON.parse(contents);
};

describe("Deploy", () => {
    let spec = null;
    let clock = null;
    let region = null;

    beforeEach(() => {
        spec = loadFixture("swagger-single-method");
        clock = sinon.useFakeTimers();
        region = "us-west-2";
    });

    afterEach(() => {
        clock.restore();
    });

    it ("should create a new api", async () => {
        let logStub = sinon.stub();
        let restapisStub = sinon.stub().resolves([]);
        let createRestapiStub = sinon.stub();
        let deploy = proxyquire("../../lib/deploy", {
            "../lib/apigateway": {
                restapis: restapisStub,
                createRestapi: createRestapiStub
            }
        });

        await deploy.createApi(logStub, region, "api", "api");

        expect(restapisStub.withArgs(region).calledOnce).to.eql(true);
        expect(createRestapiStub.withArgs(region, "api", "api").calledOnce).to.eql(true);
    });

    it ("should not create an api if it already exists", async () => {
        let logStub = sinon.stub();
        let restapisStub = sinon.stub().resolves([{ name: "api" }]);
        let createRestapiStub = sinon.stub();
        let deploy = proxyquire("../../lib/deploy", {
            "../lib/apigateway": {
                restapis: restapisStub,
                createRestapi: createRestapiStub
            }
        });

        let api = await deploy.createApi(logStub, region, "api", "api");

        expect(restapisStub.withArgs(region).calledOnce).to.eql(true);
        expect(api).to.eql({ name: "api" });
        expect(createRestapiStub.callCount).to.eql(0);
    });

    describe("Create Resources", () => {
        it ("should create a resource", async () => {
            let resourcesStub = sinon.stub().resolves([{ path: "/", id: "x" }]);
            let createResourceStub = sinon.stub().resolves({ path: "/test", pathPart: "test", id: "y", parentId: "x" });
            let deploy = proxyquire("../../lib/deploy", {
                "../lib/apigateway": {
                    resources: resourcesStub,
                    createResource: createResourceStub
                }
            });

            let testSpec = { paths: { "/test": { get: { } } } };

            await deploy.createResources(region, { id: "y" }, testSpec);

            expect(createResourceStub.withArgs(region, "y", "x", "test").calledOnce).to.eql(true);
        });

        it ("should create a nested resource", async () => {
            let resourcesStub = sinon.stub().resolves([{ path: "/", id: "x" }]);
            let createResourceStub = sinon.stub();
            let deploy = proxyquire("../../lib/deploy", {
                "../lib/apigateway": {
                    resources: resourcesStub,
                    createResource: createResourceStub
                }
            });

            let testSpec = { paths: { "/nested/test": { get: { } } } };

            createResourceStub.onCall(0).resolves({ path: "/nested", pathPart: "nested", id: "y", parentId: "x" });
            createResourceStub.onCall(1).resolves({ path: "/nested/test", pathPart: "test", id: "z", parentId: "y" });

            await deploy.createResources(region, { id: "a" }, testSpec);

            expect(createResourceStub.calledTwice).to.eql(true);
            expect(createResourceStub.withArgs(region, "a", "x", "nested").calledOnce).to.eql(true);
            expect(createResourceStub.withArgs(region, "a", "y", "test").calledOnce).to.eql(true);
        });

        it ("should create a nested resource with existing middle path", async () => {
            let resourcesStub = sinon.stub().resolves([
                { path: "/", id: "x" },
                { path: "/nested/middle", id: "z" }
            ]);
            let createResourceStub = sinon.stub();
            let deploy = proxyquire("../../lib/deploy", {
                "../lib/apigateway": {
                    resources: resourcesStub,
                    createResource: createResourceStub
                }
            });

            let testSpec = { paths: { "/nested/middle/test": { get: { } } } };

            createResourceStub.onCall(0).resolves({ path: "/nested", pathPart: "nested", id: "y", parentId: "x" });
            createResourceStub.onCall(1).resolves({ path: "/nested/middle/test", pathPart: "test", id: "0", parentId: "z" });

            await deploy.createResources(region, { id: "a" }, testSpec);

            expect(createResourceStub.calledTwice).to.eql(true);
            expect(createResourceStub.withArgs(region, "a", "x", "nested").calledOnce).to.eql(true);
            expect(createResourceStub.withArgs(region, "a", "z", "test").calledOnce).to.eql(true);
        });
    });

    describe("List Lambda Functions", () => {
        it ("should list all lambda functions", async () => {
            let listFuncsStub = sinon.stub().yields(null, { Functions: ["a", "b"]});
            let deploy = proxyquire("../../lib/deploy", {
                "aws-sdk": {
                    Lambda: function() {
                        return {
                            createFunction: sinon.stub(),
                            addPermission: sinon.stub(),
                            updateFunctionCode: sinon.stub(),
                            updateFunctionConfiguration: sinon.stub(),
                            listFunctions: listFuncsStub
                        };
                    }
                }
            });

            let funcs = await deploy.listAllFunctions(region);

            expect(funcs).to.eql(["a", "b"]);
        });

        it ("should list all lambda fns with multiple listFunctions calls", async () => {
            let listFuncsStub = sinon.stub();
            let deploy = proxyquire("../../lib/deploy", {
                "aws-sdk": {
                    Lambda: function() {
                        return {
                            createFunction: sinon.stub(),
                            addPermission: sinon.stub(),
                            updateFunctionCode: sinon.stub(),
                            updateFunctionConfiguration: sinon.stub(),
                            listFunctions: listFuncsStub
                        };
                    }
                }
            });

            listFuncsStub.onCall(0).yields(null, { Functions: ["a", "b"], NextMarker: "marker" });
            listFuncsStub.onCall(1).yields(null, { Functions: ["c", "d"]});

            let funcs = await deploy.listAllFunctions(region);

            expect(funcs).to.eql(["a", "b", "c", "d"]);
            expect(listFuncsStub.calledTwice).to.eql(true);
            expect(listFuncsStub.withArgs({ MaxItems: 10000 }).calledOnce).to.eql(true);
            expect(listFuncsStub.withArgs({ MaxItems: 10000, NextMarker: "marker" }).calledOnce).to.eql(true);
        });
    });

    it ("should deploy a new API", async function() {
        this.timeout(60000);

        let accountId        = "1234567890";
        let transpileStub    = sinon.stub();
        let npmInstallStub   = sinon.stub();
        let restapisStub     = sinon.stub().resolves([]);
        let createApiStub    = sinon.stub().resolves(loadFixture("restapis-post"));
        let resourcesStub    = sinon.stub();
        let createResStub    = sinon.stub().resolves(loadFixture("resources-post"));
        let methodStub       = sinon.stub().resolves(null);
        let createMethodStub = sinon.stub().resolves(loadFixture("methods-put"));
        let zipStub          = sinon.stub().resolves("foo");
        let getUserStub      = sinon.stub().yields(null, { User: { Arn: `arn:aws:iam::${accountId}:root` } });
        let createFuncStub   = sinon.stub().yields(null, {});
        let addPermStub      = sinon.stub().yields(null, {});
        let updateFuncCodeStub = sinon.stub().yields(null, {});
        let updateFuncConfigStub = sinon.stub().yields(null, {});
        let listFuncsStub    = sinon.stub().yields(null, { Functions: []});
        let createIntegrationStub = sinon.stub().resolves({});
        let createMethodResponseStub = sinon.stub().resolves({});
        let createIntegrationResponseStub = sinon.stub().resolves({});
        let deployStub       = sinon.stub().resolves({});
        let deploy = proxyquire("../../lib/deploy", {
            "./transpile": transpileStub,
            "./npminstall": npmInstallStub,
            "../lib/apigateway": {
                restapis: restapisStub,
                createRestapi: createApiStub,
                resources: resourcesStub,
                createResource: createResStub,
                method: methodStub,
                createMethod: createMethodStub,
                createIntegration: createIntegrationStub,
                createMethodResponse: createMethodResponseStub,
                createIntegrationResponse: createIntegrationResponseStub,
                deploy: deployStub
            },
            "aws-sdk": {
                Lambda: function() {
                    return {
                        listFunctions: listFuncsStub,
                        createFunction: createFuncStub,
                        addPermission: addPermStub,
                        updateFunctionCode: updateFuncCodeStub,
                        updateFunctionConfiguration: updateFuncConfigStub
                    };
                },
                IAM: function() {
                    return { getUser: getUserStub };
                }
            },
            "./lambdazip": zipStub
        });
        let logFn = sinon.stub();

        resourcesStub.onCall(0).resolves([loadFixture("resources-empty-get")._embedded.item]);
        resourcesStub.onCall(1).resolves(loadFixture("resources-multiple-get")._embedded.item);

        await deploy.go("deploy", logFn, "us-west-2", "test", "v1", "dist", spec);

        let lambdaCreateArgs = {
            Code: { ZipFile: "foo" },
            FunctionName: "api-test-v1-hello-get",
            Handler: "index.handler",
            Role: `arn:aws:iam::${accountId}:role/APIGatewayLambdaExecRole`,
            Runtime: "nodejs"
        };

        let lambdaAddPermArgs = {
            Action: "lambda:InvokeFunction",
            FunctionName: "api-test-v1-hello-get",
            Principal: "apigateway.amazonaws.com",
            StatementId: `api-test-v1-hello-get-${ new Date().getTime() }`,
            SourceArn: `arn:aws:execute-api:us-west-2:${accountId}:cd14zqypi2/*/GET/hello`
        };

        expect(transpileStub.withArgs("src/v1", "dist/v1").calledOnce).to.eql(true);
        expect(npmInstallStub.withArgs("dist/v1/hello/get").calledOnce).to.eql(true);
        expect(createApiStub.withArgs("us-west-2", "api-test", "api").calledOnce).to.eql(true);
        expect(resourcesStub.withArgs("us-west-2", "cd14zqypi2").calledTwice).to.eql(true);
        expect(createResStub.withArgs("us-west-2", "cd14zqypi2", "klqt924rw3", "hello").calledOnce).to.eql(true);
        expect(createMethodStub.withArgs("us-west-2", "cd14zqypi2", "3e5141", "GET").calledOnce).to.eql(true);
        expect(zipStub.withArgs("dist/v1/hello/get").calledOnce).to.eql(true);
        expect(createFuncStub.withArgs(lambdaCreateArgs).calledOnce).to.eql(true);
        expect(addPermStub.withArgs(lambdaAddPermArgs).calledOnce).to.eql(true);
        expect(createIntegrationStub.calledOnce).to.eql(true);
        expect(createMethodResponseStub.calledThrice).to.eql(true);
        expect(createIntegrationResponseStub.calledThrice).to.eql(true);
        expect(deployStub.calledOnce).to.eql(true);
    });

    xit ("should deploy a new API with multiple methods", asyncTest(async () => {
        spec = loadFixture("swagger-multi-method");

        let accountId        = "1234567890";
        let transpileStub    = sinon.stub();
        let npmInstallStub   = sinon.stub();
        let restapisStub     = sinon.stub().resolves([]);
        let createApiStub    = sinon.stub().resolves(loadFixture("restapis-post"));
        let resourcesStub    = sinon.stub().resolves([loadFixture("resources-empty-get")._embedded.item]);
        let createResStub    = sinon.stub().resolves(loadFixture("resources-post"));
        let createMethodStub = sinon.stub().resolves(loadFixture("methods-put"));
        let zipStub          = sinon.stub().resolves("foo");
        let getUserStub      = sinon.stub().yields(null, { User: { Arn: `arn:aws:iam::${accountId}:root` } });
        let createFuncStub   = sinon.stub().yields(null, {});
        let addPermStub      = sinon.stub().yields(null, {});
        let createIntegrationStub = sinon.stub().resolves({});
        let deployStub       = sinon.stub().resolves({});
        let deploy = proxyquire("../../lib/deploy", {
            "./transpile": transpileStub,
            "./npminstall": npmInstallStub,
            "../lib/apigateway": {
                restapis: restapisStub,
                createRestapi: createApiStub,
                resources: resourcesStub,
                createResource: createResStub,
                updateMethod: createMethodStub,
                createIntegration: createIntegrationStub,
                deploy: deployStub
            },
            "aws-sdk": {
                Lambda: function() {
                    return {
                        createFunction: createFuncStub,
                        addPermission: addPermStub,
                        listFunctions: sinon.stub.yields(null, []),
                        updateFunctionCode: sinon.stub,
                        updateFunctionConfiguration: sinon.stub
                    };
                },
                IAM: function() {
                    return { getUser: getUserStub };
                }
            },
            "./lambdazip": zipStub
        });

        await deploy.go("us-west-2", "test", "v1", "dist", spec);

        expect(transpileStub.withArgs("src/v1", "dist/v1").calledOnce).to.eql(true);
        expect(npmInstallStub.withArgs("dist/v1/hello/get").calledOnce).to.eql(true);
        expect(npmInstallStub.withArgs("dist/v1/hello/post").calledOnce).to.eql(true);
        expect(createApiStub.withArgs("us-west-2", "api-test", "api").calledOnce).to.eql(true);
        expect(resourcesStub.withArgs("us-west-2", "cd14zqypi2").calledOnce).to.eql(true);
        expect(resourcesStub.calledTwice).to.eql(true);
        expect(createResStub.withArgs("us-west-2", "cd14zqypi2", "klqt924rw3", "hello").calledOnce).to.eql(true);
        expect(createMethodStub.withArgs("us-west-2", "cd14zqypi2", "3e5141", "GET").calledOnce).to.eql(true);
        expect(zipStub.withArgs("dist/v1/hello/get").calledOnce).to.eql(true);
        expect(createIntegrationStub.calledOnce).to.eql(true);
        expect(deployStub.calledOnce).to.eql(true);
    }));
});
