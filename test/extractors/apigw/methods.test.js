import data from "../../fixtures/extractors/apigw.json";
import { extract } from "../../../src/extractors/apigw/methods";

describe ("Extract API GW Methods", () => {
    it ("should extract methods from the resources data", () => {
        let methods = extract(data);
        expect(methods.length).to.eql(11);
        expect(methods[0]).to.eql({
            apiKeyRequired: false,
            authorizationType: "NONE",
            httpMethod: "POST",
            id: "3bxi9w",
            path: "/hello",
            requestParameters: {}
        });
    });
});
