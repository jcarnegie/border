import r from "ramda";
import spec from "../../fixtures/extractors/swagger.json";
import { extract } from "../../../src/extractors/swagger/resources";

describe ("Extract Swagger Resources", () => {
    it ("should extract resources from a swagger spec", () => {
        let resources = r.map(path => {
            return { path };
        }, r.keys(spec.paths));
        expect(extract(spec)).to.eql(resources);
    });
});
