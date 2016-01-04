import r from "ramda";
import spec from "../../fixtures/extractors/swagger.json";
import { extract } from "../../../src/extractors/swagger/integrations";

let hasRequiredProps = r.allPass([
    r.has("path"),
    r.has("resourceMethod"),
    r.has("httpMethod"),
    r.has("type")
]);

describe("Extract Swagger Integrations", () => {
    it("should extract integrations from swagger spec", () => {
        let integrations = extract(spec);
        expect(integrations.length).to.eql(10);
        expect(r.all(hasRequiredProps, integrations)).to.eql(true);
    });

    it("should override defaults from spec", () => {
        let modifiedSpec = r.clone(spec);
        modifiedSpec.paths["/auth/session"].post["x-aws-apigateway"] = {
            httpMethod: "GET",
            type: "HTTP",
            uri: "http://www.google.com"
        };
        let integrations = extract(modifiedSpec);
        let integration = r.find(
            r.where({
                path: r.equals("/auth/session"),
                resourceMethod: r.equals("POST")
            }), integrations);
        expect(integration.httpMethod).to.eql("GET");
        expect(integration.type).to.eql("HTTP");
        expect(integration.uri).to.eql("http://www.google.com");
    });
});
