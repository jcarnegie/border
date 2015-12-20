import { logger } from "./util/logger";
import tools from "../tools";

let region = process.env.AWS_DEFAULT_REGION;
let env    = process.env.NODE_ENV || "development";

export default async (stage) => {
    try {
        await tools.deploy("deploy", logger, region, env, stage, "dist");
    } catch (e) {
        console.error(e); // eslint-disable-line no-console
    }
};
