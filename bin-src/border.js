#!/usr/bin/env node

import "babel-polyfill";
import program from "commander";
import deploy from "../lib/actions/deploy";
import build from "../lib/actions/build";
import dev from "../lib/actions/dev";

program
    .command("deploy <stage>")
    .action(deploy);

program
    .command("build <stage>")
    .action(build);

program
    .command("dev <stage>")
    .action(dev);

program.parse(process.argv);
