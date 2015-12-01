import r from "ramda";
// import qs from "querystring";
import aws4 from "aws4";
import https from "https";
import Promise from "bluebird";

let request = async (options) => {
    return new Promise((resolve, reject) => {
        let req = null;
        let signedReq = null;
        let opts = options || {};

        opts.headers = opts.headers || {};
        opts.body = opts.body || "";

        if (opts.method === "POST" || opts.method === "PUT") {
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
                if (res.statusCode < 200 || res.statusCode >= 300) {
                    console.log(`${res.statusCode} ${opts.method} - ${opts.path} ${data.replace(/\n$/, "")}`);
                }
                if (res.statusCode >= 500 && res.statusCode < 600) {
                    return reject(res);
                }

                let jsonTypes = ["application/json", "application/hal+json"];
                if (r.contains(res.headers["content-type"], jsonTypes)) {
                    data = JSON.parse(data);
                }
                resolve(data, res);
            });
        });

        req.on("error", (e) => {
            reject(e);
        });

        if (opts.method === "POST" || opts.method === "PUT") {
            req.write(opts.body);
        }

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

let put = async (opts) => {
    return request(r.merge(opts, {
        method: "PUT",
        headers: { "Content-Type": "application/json" }
    }));
};

export default {
    request,
    get,
    post,
    put
};
