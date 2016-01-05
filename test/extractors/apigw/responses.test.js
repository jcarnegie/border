import r from "ramda";
import data from "../../fixtures/extractors/apigw.json";
import { extract } from "../../../src/extractors/apigw/responses";

let hasRequiredProps = r.allPass([
    r.has("id"),
    r.has("path"),
    r.has("resourceMethod"),
    r.has("statusCode"),
    r.has("responseModels"),
    r.has("responseParameters")
]);

describe ("Extract API GW Responses", () => {
    it ("should extract responses from the resources data", () => {
        let responses = extract(data);
        expect(r.all(hasRequiredProps, responses)).to.eql(true);
        expect(responses.length).to.eql(37);
    });
});
