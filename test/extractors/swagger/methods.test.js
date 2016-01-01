import r from "ramda";
import spec from "../../fixtures/extractors/swagger.json";
import { extract } from "../../../src/extractors/swagger/methods";

describe ("Extract Swagger Methods", () => {
    it ("should extract resources from a swagger spec", () => {
        expect(extract(spec)[0]).to.eql({
            apiKeyRequired: true,
            authorizationType: "NONE",
            httpMethod: "post",
            path: "/auth/session",
            requestParameters: {
                "method.request.header.Accept": true,
                "method.request.header.Accept-Encoding": true,
                "method.request.header.Accept-Language": true,
                "method.request.header.Connection": true,
                "method.request.header.Host": true,
                "method.request.header.Pragma": true,
                "method.request.header.Referer": true,
                "method.request.header.User-Agent": true,
            },
            "x-aws-apigateway": {
                apiKeyRequired: true
            }
        });
    });
});
