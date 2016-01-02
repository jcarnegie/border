import r from "ramda";
import data from "../fixtures/extractors/apigw.json";
import swagger from "../fixtures/extractors/swagger.json";
import { updatedMethods } from "../../src/extractors/updatedmethods";

describe ("Extract Missing Methods", () => {
    let spec = null;

    beforeEach(() => {
        spec = r.clone(swagger);
    });

    it ("should extract missing methods", () => {
        let methods = updatedMethods(data, spec);
        let updated = r.map(r.pick(["path", "httpMethod"]), methods);
        expect(updated).to.eql([
            { path: "/auth/session", httpMethod: "POST" },
            { path: "/search/images", httpMethod: "GET" },
            { path: "/users", httpMethod: "POST" }
        ]);
    });
});
