import r from "ramda";
import data from "../fixtures/extractors/apigw.json";
import swagger from "../fixtures/extractors/swagger.json";
import { missingResponses } from "../../src/extractors/missingresponses";

describe ("Extract Missing Responses", () => {
    let spec = null;

    beforeEach(() => {
        spec = r.clone(swagger);
        spec.paths = r.merge(spec.paths, {
            "/test/missing": {
                get: {
                    description: "test for missing responses",
                    responses: {
                        "403": { // eslint-disable-line
                            description: "not authorized"
                        }
                    }
                }
            }
        });
    });

    it ("should extract missing responses", () => {
        expect(missingResponses(data, spec)).to.eql([{
            path: "/test/missing",
            resourceMethod: "GET",
            responseModels: {},
            responseParameters: {},
            statusCode: "403"
        }]);
    });
});
