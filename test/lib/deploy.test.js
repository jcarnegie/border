import "babel/polyfill";
import proxyquire from "proxyquire";
import asyncTest from "../asynctest";
import Bluebird from "bluebird";
import sinon from "sinon";
import chai from "chai";
import sap from "sinon-as-promised"
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

    beforeEach(() => {
        spec = loadFixture("swagger-single-method");
    });

    it ("should deploy a new API", async function() {
        let accountId        = "1234567890";
        let transpileStub    = sinon.stub();
        let npmInstallStub   = sinon.stub();
        let restapisStub     = sinon.stub().resolves([]);
        let createApiStub    = sinon.stub().resolves(loadFixture("restapis-post"));
        let resourcesStub    = sinon.stub();
        let createResStub    = sinon.stub().resolves(loadFixture("resources-post"));
        let updateMethodStub = sinon.stub().resolves(loadFixture("methods-put"));
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
                updateMethod: updateMethodStub,
                createIntegration: createIntegrationStub,
                deploy: deployStub
            },
            "aws-sdk": {
                Lambda: function() {
                    return {
                        createFunction: createFuncStub,
                        addPermission: addPermStub
                    }
                },
                IAM: function() {
                    return { getUser: getUserStub }
                }
            },
            "./lambdazip": zipStub
        });

        resourcesStub.onCall(0).resolves([loadFixture("resources-empty-get")._embedded.item]);
        resourcesStub.onCall(1).resolves(loadFixture("resources-multiple-get")._embedded.item);

        let res = await deploy.go("us-west-2", "test", "v1", spec, "dist");

        let lambdaCreateArgs = {
            Code: { ZipFile: "foo" },
            FunctionName: "api-test-v1-hello-get",
            Handler: "handler",
            Role: `arn:aws:iam::${accountId}:role/lambda_basic_execution`,
            Runtime: "nodejs"
        };

        let lambdaAddPermArgs = {
            Action: "lambda:InvokeFunction",
            FunctionName: "api-test-v1-hello-get",
            Principal: "apigateway.amazonaws.com",
            StatementId: "api-test-v1-hello-get",
            SourceArn: "arn:aws:apigateway:us-west-2::3e5141:/hello"
        };

        expect(transpileStub.withArgs("src/v1", "dist/v1").calledOnce).to.eql(true);
        expect(npmInstallStub.withArgs("dist/v1/hello/get").calledOnce).to.eql(true);
        expect(createApiStub.withArgs("us-west-2", "api-test", "api").calledOnce).to.eql(true);
        expect(resourcesStub.withArgs("us-west-2", "cd14zqypi2").calledTwice).to.eql(true);
        expect(createResStub.withArgs("us-west-2", "cd14zqypi2", "klqt924rw3", "hello").calledOnce).to.eql(true);
        expect(updateMethodStub.withArgs("us-west-2", "cd14zqypi2", "3e5141", "GET").calledOnce).to.eql(true);
        expect(zipStub.withArgs("dist/v1/hello/get").calledOnce).to.eql(true);
        expect(createFuncStub.withArgs(lambdaCreateArgs).calledOnce).to.eql(true);
        expect(addPermStub.withArgs(lambdaAddPermArgs).calledOnce).to.eql(true);
        expect(createIntegrationStub.calledOnce).to.eql(true);
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
        let updateMethodStub = sinon.stub().resolves(loadFixture("methods-put"));
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
                updateMethod: updateMethodStub,
                createIntegration: createIntegrationStub,
                deploy: deployStub
            },
            "aws-sdk": {
                Lambda: function() {
                    return {
                        createFunction: createFuncStub,
                        addPermission: addPermStub
                    }
                },
                IAM: function() {
                    return { getUser: getUserStub }
                }
            },
            "./lambdazip": zipStub
        });

        let res = await deploy.go("us-west-2", "test", "v1", spec, "dist");

        expect(transpileStub.withArgs("src/v1", "dist/v1").calledOnce).to.eql(true);
        expect(npmInstallStub.withArgs("dist/v1/hello/get").calledOnce).to.eql(true);
        expect(npmInstallStub.withArgs("dist/v1/hello/post").calledOnce).to.eql(true);
        expect(createApiStub.withArgs("us-west-2", "api-test", "api").calledOnce).to.eql(true);
        expect(resourcesStub.withArgs("us-west-2", "cd14zqypi2").calledOnce).to.eql(true);
        expect(resourcesStub.calledTwice).to.eql(true);
        expect(createResStub.withArgs("us-west-2", "cd14zqypi2", "klqt924rw3", "hello").calledOnce).to.eql(true);
        expect(updateMethodStub.withArgs("us-west-2", "cd14zqypi2", "3e5141", "GET").calledOnce).to.eql(true);
        expect(zipStub.withArgs("dist/v1/hello/get").calledOnce).to.eql(true);
        expect(createFuncStub.withArgs(lambdaCreateArgs).calledOnce).to.eql(true);
        expect(addPermStub.withArgs(lambdaAddPermArgs).calledOnce).to.eql(true);
        expect(createIntegrationStub.calledOnce).to.eql(true);
        expect(deployStub.calledOnce).to.eql(true);
    }));

});
