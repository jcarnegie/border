import "babel/polyfill";
import proxyquire from "proxyquire";
// import gateway from "../../tasks/apigateway"
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
        spec = {
            swagger: "2.0",
            info: {
                version: "0.0.0",
                title: "api"
            },
            paths: {
                "/hello": {
                    get: {
                        description: "Prints \"Hello, world\"\n",
                        responses: {
                            200: {
                                description: "Successful response",
                                schema: {
                                    title: "Response",
                                    type: "object",
                                    properties: {
                                        hello: {
                                            type: "string"
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        };
    });

    it ("should create a new API", async () => {
        let transpileStub    = sinon.stub();
        let npmInstallStub   = sinon.stub();
        let createApiStub    = sinon.stub().resolves(loadFixture("restapis-post"));
        let resourcesStub    = sinon.stub().resolves([loadFixture("resources-empty-get")._embedded.item]);
        let createResStub    = sinon.stub().resolves(loadFixture("resources-post"));
        let updateMethodStub = sinon.stub().resolves(loadFixture("methods-put"));
        let zipStub          = sinon.stub().resolves("foo");
        let createFuncStub   = sinon.stub().yields(null, {});
        let deploy = proxyquire("../../lib/deploy", {
            "./transpile": transpileStub,
            "./npminstall": npmInstallStub,
            "../tasks/apigateway": {
                createRestapi: createApiStub,
                resources: resourcesStub,
                createResource: createResStub,
                updateMethod: updateMethodStub
            },
            "aws-sdk": {
                Lambda: function() {
                    return {
                        createFunction: createFuncStub
                    }
                }
            },
            "./lambdazip": zipStub
        });

        let res = await deploy.go("us-west-2", "test", "api", "v1", spec, "dist");

        let lambdaCreateArgs = { Code: { ZipFile: "foo" } };

        expect(transpileStub.withArgs("v1", "dist").calledOnce).to.eql(true);
        expect(npmInstallStub.withArgs("dist/v1/hello").calledOnce).to.eql(true);
        expect(createApiStub.withArgs("us-west-2", "api-test", "").calledOnce).to.eql(true);
        expect(resourcesStub.withArgs("us-west-2", "cd14zqypi2").calledOnce).to.eql(true);
        expect(createResStub.withArgs("us-west-2", "cd14zqypi2", "klqt924rw3", "hello").calledOnce).to.eql(true);
        expect(updateMethodStub.withArgs("us-west-2", "cd14zqypi2", "3e5141", "GET").calledOnce).to.eql(true);
        expect(zipStub.withArgs("dist/v1/hello").calledOnce).to.eql(true);
        expect(createFuncStub.withArgs(lambdaCreateArgs).calledOnce).to.eql(true);
        // expect(res.status).to.eql(0);
        // expect(res.output.length).to.be.gt(0);
    });
});
