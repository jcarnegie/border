import { build } from "./swagger";
import deploy from "./deploy";

export default {
    deploy: async (action, msgFn, region, env, stage, dest) => {
        let spec = await build(stage);
        return await deploy.go(action, msgFn, region, env, stage, dest, spec);
    }
};
