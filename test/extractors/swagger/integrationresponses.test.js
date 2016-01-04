import r from "ramda";
import spec from "../../fixtures/extractors/swagger.json";
import { extract } from "../../../src/extractors/swagger/integrationresponses";

let hasRequiredProps = r.allPass([
    r.has("path"),
    r.has("httpMethod"),
    r.has("statusCode"),
    r.has("selectionPattern")
]);

describe("Extract Swagger Integration Responses", () => {
    let integrationResponses = null;

    beforeEach(() => {
        integrationResponses = extract(spec);
    });

    it("should extract integration responses from swagger spec", () => {
        expect(integrationResponses.length).to.eql(36);
        expect(r.all(hasRequiredProps, integrationResponses)).to.eql(true);
    });

    it("should set selectionPattern to null for 200 responses", () => {
        let two00Responses = r.filter(r.propEq("statusCode", 200));
        let selectionPatterns = r.map(r.prop("selectionPattern"), two00Responses);
        expect(r.all(r.isNil, selectionPatterns)).to.eql(true);
    });

    // it("should override defaults from spec", () => {
    //     let modifiedSpec = r.clone(spec);
    //     modifiedSpec.paths["/auth/session"].post["x-aws-apigateway"] = {
    //         httpMethod: "GET",
    //         type: "HTTP",
    //         uri: "http://www.google.com"
    //     };
    //     let integrations = extract(modifiedSpec);
    //     let integration = r.find(
    //         r.where({
    //             path: r.equals("/auth/session"),
    //             resourceMethod: r.equals("POST")
    //         }), integrations);
    //     expect(integration.httpMethod).to.eql("GET");
    //     expect(integration.type).to.eql("HTTP");
    //     expect(integration.uri).to.eql("http://www.google.com");
    // });
});
