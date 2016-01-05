import r from "ramda";
import data from "../fixtures/extractors/apigw.json";
import swagger from "../fixtures/extractors/swagger.json";
import { updatedIntegrationResponses } from "../../src/extractors/updatedintegrationresponses";

describe ("Extract Updated Integrations", () => {
    let spec = null;

    beforeEach(() => {
        spec = r.clone(swagger);
    });

    it ("should extract updated integrations", () => {
        spec.paths["/auth/session"].post.responses["400"] = {
            description: "not authorized",
            "x-aws-apigateway": {
                selectionPattern: "status_code: 400"
            }
        };
        let updated = updatedIntegrationResponses(data, spec);
        expect(updated).to.eql([{
            id: "meh8b3",
            path: "/auth/session",
            resourceMethod: "POST",
            responseTemplates: {
                "application/json": null
            },
            statusCode: "400",
            selectionPattern: "400"
        }]);
    });
});
