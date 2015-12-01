import crypto from "crypto";
import AWS from "aws-sdk";

let filehash = (name, type, size) => {
    if (!name || !type || !size) {
        throw new Error("missing one of parameters of (name, type, size)");
    }
    return (crypto
        .createHash("sha256")
        .update(name + type + size)
        .digest("hex"));
};


export let handler = (event, context) => {
    let filename = `${filehash(req.query.objectName, req.query.contentType, req.query.contentSize)}`;
    let mimeType = req.query.contentType;
    let fileKey  = `public/upload/${filename}`; // Avoid prepending slash here, would create a `ghost path` (unnamed subroot) in S3
    let s3       = new AWS.S3();
    let params   = {
        Bucket: S3_BUCKET,
        Key: fileKey,
        Expires: 60,
        ContentType: mimeType,
        ACL: options.ACL || "private"
    };
    s3.getSignedUrl("putObject", params, (err, data) => {
        if (err) {
            process.stdout.write(`${err}\n`);
            return res.send(500, "Cannot create S3 signed URL");
        }
        res.json({
            signedUrl: data,
            publicUrl: fileKey,
            filename
        });
    });
};
