import resources from "../fixtures/import/resources.json";
import importer from "../../src/import/apigateway";

describe("Import from API Gateway", () => {
    it ("should import resources", () => {
        let api = importer(resources);
        // console.log(JSON.stringify(api, 4, null));
    });
});
