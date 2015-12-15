#!/usr/bin/env node

import "babel-polyfill";
import tools from "../lib/tools";
import "colors";

let region = process.env.AWS_DEFAULT_REGION;
let env    = process.env.NODE_ENV || "development";
let action = process.argv[2];
let stage  = process.argv[3] || "deploy";
let color  = (str) => {
    switch (str) {
    case "ok":
        return str.green;
    case "warn":
    case "warning":
        return str.yellow;
    case "err":
    case "error":
        return str.red;
    case "fatal":
        return str.black;
    default:
        return str;
    }
};
let logger = (level, msg) => {
    console.log(`[${color(level)}] ${msg}`); // eslint-disable-line no-console
};

let main = async () => {
    try {
        await tools.deploy(action, logger, region, env, stage, "dist");
    } catch (e) {
        console.error(e); // eslint-disable-line no-console
    }
};

main();
