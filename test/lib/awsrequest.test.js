import "babel/polyfill";
import asyncTest from "./../asynctest.js";
import proxyquire from "proxyquire";
import chai from "chai";

// let expect = chai.expect;
//
// let stubbedRequest = (responseText, error) => {
//     return proxyquire("../../lib/awsrequest", {
//         "https": {
//             request: (opts, cb) => {
//                 let res = {
//                     on: (event, done) => {
//                         switch (event) {
//                         case "data":
//                             return done(responseText);
//                         case "end":
//                             return done();
//                         default:
//                             return null;
//                         }
//                     }
//                 };
//
//                 cb(res);
//             }
//         }
//     });
// };

describe ("awsrequest", () => {
    describe ("request", () => {
        // it ("should make a get request", asyncTest(async () => {
        //     // let awsreq = stubbedRequest("blah");
        //     // let res = await awsreq.request({ method: "GET" });
        //     // expect(res).to.eql("blah");
        // }));

        it ("should return json for application/json get request", () => {
        });
    });
});
