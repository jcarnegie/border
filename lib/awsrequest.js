import r from "ramda";
import qs from "querystring";
import aws4 from "aws4";
import https from "https";
import Promise from "bluebird";

let request = async (opts) => {
    return new Promise((resolve, reject) => {
        let req = null;
        let signedReq = null;

        opts = opts || {};
        opts.body = opts.body || "";

        if (opts.method === "POST") {
            opts.body = JSON.stringify(opts.body);
            opts.headers["Content-Length"] = opts.body.length;
        }

        signedReq = aws4.sign(opts);
        req = https.request(signedReq, (res) => {
            let data = "";
            res.setEncoding("utf8");
            res.on("data", (chunk) => {
                data += chunk;
            });
            res.on("end", () => {
                let jsonTypes = ["application/json", "application/hal+json"];
                if (r.contains(res.headers["content-type"], jsonTypes)) {
                    data = JSON.parse(data);
                }
                resolve(data, res);
            });
        });

        req.on("error", (e) => { reject(e); });
        if (opts.method === "POST") { req.write(opts.body); }
        req.end();
    });
};

let get = async (opts) => {
    return request(r.merge(opts, { method: "GET" }));
};

let post = async (opts) => {
    return request(r.merge(opts, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
    }));
};

export default {
    request,
    get,
    post
};
