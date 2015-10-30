import "babel/polyfill";
import r from "ramda";
import awsreq from "../../lib/awsrequest";
import gateway from "../../tasks/apigateway";
import asyncTest from "../asynctest";

let test = async (region) => {
    region = region || process.env.AWS_DEFAULT_REGION;
    let data = await awsreq.get({
        host: `apigateway.${region}.amazonaws.com`,
        region: region,
        // path: "/restapis/lnty9f2aze/resources"
        path: "/restapis/tjkej05oa6/resources/w874gw32sa/methods/GET"
    });
    return data;
}


describe("Create", async () => {

    beforeEach(asyncTest(async () => {
        let data = await test("us-west-2");
        console.log(JSON.stringify(data, null, 4));
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


    it ("should create a new API gateway", (done) => {
        // 1. POST /restapis - creates a new api gateway using name, description from the swagger def
        // 2. For each path in the swagger
        //    3.

        let apiDef = {
            name: "api",

        };

        // x

        gateway.create(apiDef);

        done();
    });
});
