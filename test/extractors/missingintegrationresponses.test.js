import r from "ramda";
import data from "../fixtures/extractors/apigw.json";
import swagger from "../fixtures/extractors/swagger.json";
import { missingIntegrationResponses } from "../../src/extractors/missingintegrationresponses";

describe ("Extract Missing Integrations", () => {
    let spec = null;

    beforeEach(() => {
        spec = r.clone(swagger);
        spec.paths = r.merge(spec.paths, {
            "/test/missing": {
                get: {
                    description: "test for missing methods",
                    responses: {
                        "200": { // eslint-disable-line
                            description: "Success"
                        },
                        "400": { // eslint-disable-line
                            description: "Bad Request"
                        }
                    }
                }
            }
        });
    });

    it ("should extract missing methods", () => {
        let missing = missingIntegrationResponses(data, spec);
        expect(missing).to.eql([{
            path: "/users/feed",
            resourceMethod: "GET",
            statusCode: "401",
            selectionPattern: "401"
        }, {
            path: "/test/missing",
            resourceMethod: "GET",
            statusCode: "200",
            selectionPattern: null
        }, {
            path: "/test/missing",
            resourceMethod: "GET",
            statusCode: "400",
            selectionPattern: "400"
        }]);
    });
});
