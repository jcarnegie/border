import apigateway from "./apigateway";
import swagger from "./swagger";
import updateResources from "./update/resources";

export default async (region, apiId, stage) => {
    let awsgwResourceData = await apigateway.embeddedResources(region, apiId);
    let swaggerSpec = await swagger.build(stage);

    await updateResources(region, apiId, stage, awsgwResourceData, swaggerSpec);
};
