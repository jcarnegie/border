import "babel/polyfill";
import gateway from "../../tasks/apigateway";
import asyncTest from "../asynctest";

describe("Create", async () => {
    it ("should create a new API gateway", asyncTest(async () => {
        let res = await gateway.deploy("us-west-2", "1570sznoq2", "test");
        console.log(JSON.stringify(res, null, 4));
    }));
});
