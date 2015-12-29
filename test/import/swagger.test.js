import spec from "../fixtures/import/swagger.json";
import importer from "../../src/import/swagger";

describe("Import from Swagger", () => {
    it ("should import", () => {
        let resources = importer(spec);
        console.log(JSON.stringify(resources, null, 4));
    });
});
