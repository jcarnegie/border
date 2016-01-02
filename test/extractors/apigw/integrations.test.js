import r from "ramda";
import data from "../../fixtures/extractors/apigw.json";
import { extract } from "../../../src/extractors/apigw/integrations";

let hasRequiredProps = r.allPass([
    r.has("id"),
    r.has("path"),
    r.has("resourceMethod"),
    r.has("cacheKeyParameters"),
    r.has("cacheNamespace"),
    r.has("httpMethod"),
    r.has("type"),
    r.has("uri")
]);

describe ("Extract API GW Integrations", () => {
    it ("should extract methods from the resources data", () => {
        let integrations = extract(data);
        expect(r.all(hasRequiredProps, integrations)).to.eql(true);
        expect(r.all(r.propEq("type", "AWS")), integrations);
        expect(integrations.length).to.eql(11);
    });
});
