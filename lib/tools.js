import swagger from "./swagger";
import deploy from "./deploy";
import r from "ramda";

export default {
    deploy: async (region, env, stage, dest) => {
        let spec = await swagger.build(stage);
        return await deploy.go(region, env, stage, dest, spec);
    }
};
