import r from "ramda";
import data from "../fixtures/extractors/apigw.json";
import swagger from "../fixtures/extractors/swagger.json";
import { missingMethods } from "../../src/extractors/missingmethods";

describe ("Extract Missing Methods", () => {
    let spec = null;

    beforeEach(() => {
        spec = r.clone(swagger);
        spec.paths = r.merge(spec.paths, {
            "/test/missing": {
                get: { description: "test for missing methods" }
            }
        });
    });

    it ("should extract missing methods", () => {
        expect(missingMethods(data, spec)).to.eql([{
            apiKeyRequired: false,
            authorizationType: "NONE",
            httpMethod: "GET",
            path: "/test/missing",
            requestParameters: {
                "method.request.header.Accept": true,
                "method.request.header.Accept-Encoding": true,
                "method.request.header.Accept-Language": true,
                "method.request.header.Connection": true,
                "method.request.header.Host": true,
                "method.request.header.Pragma": true,
                "method.request.header.Referer": true,
                "method.request.header.User-Agent": true,
            }
        }]);
    });
});