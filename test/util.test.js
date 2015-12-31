import chai from "chai";
import * as util from "../src/util";

let expect = chai.expect;

describe("Utilities", () => {
    describe("Reduce Async", () => {
        let asyncAdd = null;
        let init = null;
        let list = null;

        beforeEach(() => {
            asyncAdd = async (a, b) => Promise.resolve(a + b);
            init = 0;
            list = [1, 2, 3];
        });

        it("should reduce a list asynchronously", async () => {
            let sum = await util.reduceAsync(asyncAdd, init, list);
            expect(sum).to.eql(6);
        });

        it("should return the initial value if an empty list is passed in", async () => {
            let sum = await util.reduceAsync(asyncAdd, init, []);
            expect(sum).to.eql(init);
        });
    });
});
