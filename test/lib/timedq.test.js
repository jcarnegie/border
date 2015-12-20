import timedq from "../../lib/timedq";
import sinon from "sinon";
import chai from "chai";

let expect = chai.expect;

describe("Timed Queue", () => {
    let clock = null;
    let testFn = null;

    beforeEach(() => {
        clock = sinon.useFakeTimers();

        testFn = (timeout) => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve(new Date().getTime());
                }, timeout);
            });
        };
    });

    afterEach(() => {
        clock.restore();
    });

    it ("should process a single item", async () => {
        let timeout = 5;
        let fn = timedq(testFn, 100);
        let p = fn(timeout);
        clock.tick(timeout);
        let res = await p;
        expect(res).to.eql(timeout);
    });

    it ("should process multiple items", async () => {
        let timeout = 5;
        let fn = timedq(testFn, 100);
        let p1 = fn(timeout);
        clock.tick(3);
        let p2 = fn(timeout);
        clock.tick(102);
        let res1 = await p1;
        let res2 = await p2;
        expect(res1).to.eql(timeout);
        expect(res2).to.eql(105);
    });

    it ("should process an item immediately if past timer", async () => {
        let timeout = 5;
        let fn = timedq(testFn, 100);
        let p1 = fn(timeout);
        clock.tick(110);
        let p2 = fn(timeout);
        clock.tick(5);
        let res1 = await p1;
        let res2 = await p2;
        expect(res1).to.eql(timeout);
        expect(res2).to.eql(115);
    });

    it ("should process N items in a given time period", async () => {
        let count = 0;
        let timeout = 1;
        let fn = timedq(testFn, 10);
        fn(timeout).then(() => ++count);
        fn(timeout).then(() => ++count);
        fn(timeout).then(() => ++count);
        fn(timeout).then(() => ++count);
        fn(timeout).then(() => ++count);
        setTimeout(() => {
            expect(count).to.eql(4);
        }, 50);
        clock.tick(45);
    });
});
