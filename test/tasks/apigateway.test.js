import "babel/polyfill";
// import r from "ramda";
// import awsreq from "../../lib/awsrequest";
import gateway from "../../tasks/apigateway";
import asyncTest from "../asynctest";

// let test = async (region) => {
//     let reg  = region || process.env.AWS_DEFAULT_REGION;
//     let data = await awsreq.get({
//         host:   `apigateway.${reg}.amazonaws.com`,
//         region: reg,
//         path:   "/restapis/tjkej05oa6/resources/w874gw32sa/methods/GET"
//     });
//     return data;
// };


xdescribe("Create", async () => {
    beforeEach(asyncTest(async () => {
        // let data = await test("us-west-2");
        // console.log(JSON.stringify(data, null, 4));
        // let res = await post({
        //     host: `apigateway.us-west-2.amazonaws.com`,
        //     region: "us-west-2",
        //     // path: "/restapis/lnty9f2aze/resources"
        //     path: "/restapis",
        //     body: {
        //         name: "test1",
        //         description: "test1"
        //     }
        // });
        // console.log(JSON.stringify(res, null, 4));
    }));


    it ("should create a new API gateway", function(done) {
        this.timeout(60000);
        console.log("inside test");
        // 1. POST /restapis - creates a new api gateway using name, description from the swagger def
        // 2. For each path in the swagger
        // 3.

        let apiDef = {
            swagger: "2.0",
            info: {
                version: "0.0.0",
                title: "api",
                description: "Intelos API"
            },
            paths: {
                "/hello/world": {
                    get: {
                        description: "Prints \"Hello, world\"\n",
                        responses: {
                            "200": { // eslint-disable-line
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


        // let res = await gateway.create(apiDef);

        async () => {
            // let met = await gateway.method("us-west-2", "cd14zqypi2", "3e5141", "GET");
            // console.log(JSON.stringify(met, null, 4));

            try {
                let res = await gateway.createIntegration({
                    region: "us-west-2",
                    apiId: "cd14zqypi2",
                    resourceId: "3e5141",
                    method: "POST",
                    type: "AWS",
                    httpMethod: "POST",
                    authorizationType: "none",
                    uri: "arn:aws:apigateway:us-west-2:lambda:path/2015-03-31/functions/arn:aws:lambda:us-west-2:018810891728:function:GetHelloWorld/invocations",
                    credentials: null,
                    requestParameters: {},
                    requestTemplates: {},
                    cacheNamespace: null,
                    cacheKeyParameters: []
                });
                console.log(JSON.stringify(res, null, 4));
            } catch (e) {
                console.error("error:", e.statusCode);
                console.error("error:", e.statusMessage);
                console.log("res keys:", r.keys(e));
            }
            done();
        }();



    });
});
