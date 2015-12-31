import r from "ramda";
import data from "../../fixtures/extractors/apigw.json";
import { extract } from "../../../src/extractors/apigw/resources";

describe ("API GW Resources Extractor", () => {
    it ("should extract a list of resources", () => {
        let resources = extract(data);
        expect(resources).to.eql(r.map(r.pick(["id", "path"]), data));
    });
});
