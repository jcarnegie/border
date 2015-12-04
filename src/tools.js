import swagger from "./swagger";
import deploy from "./deploy";
import r from "ramda";

export default {
    deploy: async (logFn, region, env, stage, dest) => {
        let spec = await swagger.build(stage);
        return await deploy.go(logFn, region, env, stage, dest, spec);
    }
};
