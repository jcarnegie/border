import r from "ramda";
import data from "../fixtures/extractors/apigw.json";
import swagger from "../fixtures/extractors/swagger.json";
import { updatedIntegrations } from "../../src/extractors/updatedintegrations";

describe ("Extract Missing Integrations", () => {
    let spec = null;

    beforeEach(() => {
        spec = r.clone(swagger);
    });

    it ("should extract missing integrations", () => {
        spec.paths["/auth/session"].post["x-aws-apigateway"] = {
            httpMethod: "GET",
            type: "HTTP",
            uri: "http://www.google.com"
        };
        let methods = updatedIntegrations(data, spec);
        let updated = r.map(r.pick(["path", "resourceMethod", "httpMethod", "type"]), methods);
        expect(updated).to.eql([{
            path: "/auth/session",
            resourceMethod: "POST",
            httpMethod: "GET",
            type: "HTTP"
        }]);
    });
});
