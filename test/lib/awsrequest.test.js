import "babel-polyfill";
import asyncTest from "./../asynctest.js";
import proxyquire from "proxyquire";
import chai from "chai";

let expect = chai.expect;

let stubbedRequest = (responseText, headers, error) => {
    return proxyquire("../../lib/awsrequest", {
        https: {
            request: (opts, cb) => {
                let res = null;
                res = {
                    headers: headers || {},

                    setEncoding(encoding) {
                        return encoding;
                    },

                    on: (event, done) => {
                        if (error) return null;
                        switch (event) {
                        case "data":
                            return done(responseText);
                        case "end":
                            return done();
                        default:
                            return null;
                        }
                    }
                };
                cb(res);

                return {
                    on: (event, done) => {
                        if (event === "error" && error) {
                            return done(error);
                        }
                    },

                    end: () => {}
                };
            }
        }
    });
};

xdescribe ("awsrequest", () => {
    describe ("request", () => {
        it ("should make a get request", asyncTest(async () => {
            let awsreq = stubbedRequest("blah");
            let res = await awsreq.request({ method: "GET" });
            expect(res).to.eql("blah");
        }));

        it ("should convert get request application/json response to JSON", asyncTest(async () => {
            let response = '{"status": "ok"}';
            let headers = { "content-type": "application/json" };
            let awsreq = stubbedRequest(response, headers);
            let res = await awsreq.request({ method: "GET" });
            expect(res).to.eql({ status: "ok" });
        }));

        it ("should make a post request", asyncTest(async () => {
            let awsreq = stubbedRequest("haha");
            let res = await awsreq.request({
                method: "POST",
                body: { foo: "bar" }
            });
            expect(res).to.eql("haha");
        }));

        it ("should convert post request application/json response to JSON", asyncTest(async () => {
            let response = '{"status": "ok"}';
            let headers = { "content-type": "application/json" };
            let awsreq = stubbedRequest(response, headers);
            let res = await awsreq.request({ method: "POST" });
            expect(res).to.eql({ status: "ok" });
        }));

        it ("should throw an error on error", asyncTest(async () => {
            let err = new Error("bad request");
            try {
                let awsreq = stubbedRequest(null, null, err);
                await awsreq.request({ method: "GET" });
            } catch (e) {
                expect(e).to.eql(err);
            }
        }));
    });
});
