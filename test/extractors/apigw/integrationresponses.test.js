import r from "ramda";
import data from "../../fixtures/extractors/apigw.json";
import { extract } from "../../../src/extractors/apigw/integrationresponses";

let hasRequiredProps = r.allPass([
    r.has("id"),
    r.has("path"),
    r.has("resourceMethod"),
    r.has("statusCode"),
    r.has("responseTemplates")
]);

describe ("Extract API GW Integration Responses", () => {
    it ("should extract integration responses from the resources data", () => {
        let integrationResponses = extract(data);
        expect(r.all(hasRequiredProps, integrationResponses)).to.eql(true);
        expect(integrationResponses.length).to.eql(36);
    });
});
