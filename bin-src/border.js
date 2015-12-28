#!/usr/bin/env node

import "babel-polyfill";
import program from "commander";
import deploy from "../lib/actions/deploy";
import build from "../lib/actions/build";
import dev from "../lib/actions/dev";
import swagger from "../lib/actions/swagger";
import apigw from "../lib/apigateway";

program
    .command("resources")
    .action(async () => {
        try {
            let res = await apigw.embeddedResources("us-west-2", "fqn4zn1bif");
            console.log(JSON.stringify(res, null, 4));
        } catch (e) {
            console.log(e);
        }
    });

program
    .command("deploy <stage>")
    .action(deploy);

program
    .command("build <stage>")
    .action(build);

program
    .command("dev <stage>")
    .action(dev);

program
    .command("swagger <stage>")
    .action(swagger);

program.parse(process.argv);
