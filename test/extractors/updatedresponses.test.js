import r from "ramda";
import data from "../fixtures/extractors/apigw.json";
import swagger from "../fixtures/extractors/swagger.json";
import { updatedResponses } from "../../src/extractors/updatedresponses";

describe ("Extract Missing Responses", () => {
    let spec = null;

    beforeEach(() => {
        spec = r.clone(swagger);
        spec.paths = {
            "/auth/session": {
                post: {
                    responses: {
                        "400": { // eslint-disable-line
                            description: "not authorized",
                            "x-aws-apigateway": {
                                responseParameters: {
                                    "application/json": "$input.json('$')"
                                }
                            }
                        }
                    }
                }
            }
        };
    });

    it ("should extract updated responses", () => {
        let apiData = r.find(r.propEq("path", "/auth/session"), data);
        expect(updatedResponses([apiData], spec)).to.eql([{
            id: "meh8b3",
            path: "/auth/session",
            resourceMethod: "POST",
            responseModels: {},
            responseParameters: {},
            statusCode: "400"
        }]);
    });
});
