import r from "ramda";
import aws4 from "aws4";
import https from "https";
import Promise from "bluebird";
import timedq from "./timedq";

let makeRequest = async (options) => {
    return new Promise((resolve, reject) => {
        let req = null;
        let signedReq = null;
        let opts = options || {};

        opts.headers = opts.headers || {};
        opts.body = opts.body || "";

        if (opts.method === "POST" || opts.method === "PUT" || opts.method === "PATCH") {
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
                if (res.statusCode >= 400) {
                    let error = data;
                    try {
                        error = JSON.parse(data).message;
                    } catch (e) { /* gulp */ }
                    return reject(new Error(error), res.statusCode, res);
                }

                let jsonTypes = ["application/json", "application/hal+json"];
                if (r.contains(res.headers["content-type"], jsonTypes)) {
                    data = JSON.parse(data);
                }
                // console.log(`resolving request: ${options.method.toUpperCase()} ${options.path}`);
                resolve(data, res);
            });
        });

        req.on("error", (e) => {
            // console.log(`rejecting request: ${options.method.toUpperCase()} ${options.path}`);
            reject(e);
        });

        if (opts.method === "POST" || opts.method === "PUT" || opts.method === "PATCH") {
            req.write(opts.body);
        }

        req.end();
    });
};

let request = timedq(makeRequest, 500);

let get = async (opts) => {
    return request(r.merge(opts, { method: "GET" }));
};

let post = async (opts) => {
    return request(r.merge(opts, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
    }));
};

let put = async (opts) => {
    return request(r.merge(opts, {
        method: "PUT",
        headers: { "Content-Type": "application/json" }
    }));
};

let patch = async (opts) => {
    return request(r.merge(opts, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" }
    }));
};


export default {
    request,
    get,
    post,
    put,
    patch
};
