#!/usr/bin/env node

import configure from "./configure";
import express from "express";

let main = async () => {
    let app = express();
    let stage = process.argv[2];

    await configure(app, stage);

    let server = app.listen(3000, () => {
        let host = server.address().address;
        let port = server.address().port;
        console.log(`API stage '${stage}' listening at http://%s:%s`, host, port);
    });
};

main();
