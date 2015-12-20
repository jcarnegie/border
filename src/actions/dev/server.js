#!/usr/bin/env node

import "babel-polyfill";
import bodyparser from "body-parser";
import configure from "./configure";
import express from "express";

let main = async () => {
    try {
        let app = express();
        app.use(bodyparser.json());

        let stage = process.argv[2];
        await configure(app, stage);

        let server = app.listen(3000, () => {
            let host = server.address().address;
            let port = server.address().port;
            console.log(`API stage '${stage}' listening at http://%s:%s`, host, port); // eslint-disable-line
        });
    } catch (e) {
        console.log("error:", e.stack); // eslint-disable-line
    }
};

main();
