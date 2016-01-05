import r from "ramda";
import spec from "../../fixtures/extractors/swagger.json";
import { extract } from "../../../src/extractors/swagger/responses";

let hasRequiredProps = r.allPass([
    r.has("path"),
    r.has("resourceMethod"),
    r.has("statusCode"),
    r.has("responseModels"),
    r.has("responseParameters")
]);

describe("Extract Swagger Responses", () => {
    let responses = null;

    beforeEach(() => {
        responses = extract(spec);
    });

    it("should extract responses from swagger spec", () => {
        expect(responses.length).to.eql(36);
        expect(r.all(hasRequiredProps, responses)).to.eql(true);
    });

    // it("should set selectionPattern to null for 200 responses", () => {
    //     let two00Responses = r.filter(r.propEq("statusCode", 200));
    //     let selectionPatterns = r.map(r.prop("selectionPattern"), two00Responses);
    //     expect(r.all(r.isNil, selectionPatterns)).to.eql(true);
    // });
    //
    // it("should override defaults from spec", () => {
    //     let modifiedSpec = r.clone(spec);
    //     modifiedSpec.paths["/auth/session"].post.responses["400"]["x-aws-apigateway"] = {
    //         selectionPattern: "status_code: 200"
    //     };
    //     let integrationResponses = extract(modifiedSpec);
    //     let integrationResponse = r.find(r.where({
    //         path: r.equals("/auth/session"),
    //         resourceMethod: r.equals("POST"),
    //         statusCode: r.equals("400")
    //     }), integrationResponses);
    //     expect(integrationResponse.selectionPattern).to.eql("status_code: 200");
    // });
});
