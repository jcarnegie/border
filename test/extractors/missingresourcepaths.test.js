import r from "ramda";
import { propNotEq } from "../../src/util";
import data from "../fixtures/extractors/apigw.json";
import spec from "../fixtures/extractors/swagger.json";
import { missingResourcePaths } from "../../src/extractors/missingresourcepaths";

describe ("Extract Missing Resource Paths", () => {
    it ("should extract a missing resource path", () => {
        let test = propNotEq("path", "/users");
        let awsResources = r.filter(test, data);
        expect(missingResourcePaths(awsResources, spec)).to.eql(["/users"]);
    });

    it ("should not extract missing resource paths", () => {
        expect(missingResourcePaths(data, spec)).to.eql([]);
    });
});
