import Promise from "bluebird";
import gateway from "../lib/apigateway";
import zip from "./lambdazip";
import pathUtil from "path";
import transpile from "./transpile";
import npmInstall from "./npminstall";
import AWS from "aws-sdk";
import r from "ramda";

let awaitable = Promise.promisify;

let lambdaFunctionName = (env, apiName, stage, path, method) => {
    let basename = path.replace(/^\//, "").replace(/\//g, "-");
    return `${apiName}-${env}-${stage}-${basename}-${method}`;
};

let extendSpec = r.curry((path, spec, method) => {
    let extSpec = r.clone(spec);
    extSpec.path = path;
    extSpec.method = method;
    return extSpec;
});

let collapseSpec = (methods, path) => {
    return r.values(r.mapObjIndexed(extendSpec(path), methods));
};

let specPathsToEndpoints = r.compose(
    r.flatten,
    r.values,
    r.mapObjIndexed(collapseSpec)
);

let go = async (region, env, stage, spec, dest) => {
    // Initial Algo
    // 1. Copy + Transpile into dist dir
    // 2. Generate dist/{{stage}}/swagger.json
    // 3. npm install in endpoint dir under dist dir
    // 4. create restapi
    // 5. get resources
    // 6. create resource
    // 7. create method
    // 8. create lambda fn
    // 9. give method permission to execute lambda fn
    // 10. create method integration
    // 11. create deployment
    // 12. point DNS to new deployment URL

    let apiName        = spec.info.title;
    let apiDesc        = spec.info.title;
    let defaultRole    = spec.info["x-lambda-exec-role"];
    let lambda         = new AWS.Lambda();
    let iam            = new AWS.IAM();
    let endpoints      = specPathsToEndpoints(spec.paths);
    let createFunction = awaitable(lambda.createFunction.bind(lambda));
    let addPermission  = awaitable(lambda.addPermission.bind(lambda));
    let getUser        = awaitable(iam.getUser.bind(iam));

    let processResource = r.curry(async (gateway, region, env, apiName, stage, dest, spec) => {
        let api = null;
        let resources = null;
        let resource = null;
        let method = null;
        let lambdaZip = null;
        let resp = null;

        try {
            await npmInstall(`${dest}/${stage}/hello/get`);

            api = await gateway.createRestapi(region, `${apiName}-${env}`, apiDesc);
            resources = await gateway.resources(region, api.id);
            resource = await gateway.createResource(region, api.id, resources[0].id, "hello");
            method = await gateway.updateMethod(region, api.id, resource.id, spec.method.toUpperCase());
            let functionName = lambdaFunctionName(env, apiName, stage, spec.path, spec.method);
            lambdaZip = await zip(`${dest}/${stage}/hello/get`, pathUtil.basename(functionName));

            let user = await getUser({});
            let accountId = user.User.Arn.split(":")[4];

            let createFuncResp = await createFunction({
                Code: { ZipFile: lambdaZip },
                FunctionName: functionName,
                Handler: "handler",
                Role: `arn:aws:iam::${accountId}:role/${defaultRole}`,
                Runtime: "nodejs"
            });

            await addPermission({
                Action: "lambda:InvokeFunction",
                FunctionName: functionName,
                Principal: "apigateway.amazonaws.com",
                StatementId: functionName,
                SourceArn: `arn:aws:apigateway:${region}::${resource.id}:${spec.path}`
            });

            await gateway.createIntegration({
                region,
                apiId: api.id,
                resourceId: resource.id,
                method: spec.method.toUpperCase(),
                credentials: null,
                httpMethod: "POST",
                type: "AWS",
                // Todo: Research how this uri may change in the future. i.e. will we need to update the date?
                uri: `arn:aws:apigateway:${region}:lambda:path/2015-03-31/functions/${createFuncResp.FunctionArn}/invocations`
            });

            await gateway.deploy(region, api.id, stage);
        } catch (e) {
            console.log("error:", e.stack);
        }
    });

    await transpile(`src/${stage}`, `${dest}/${stage}`, (f) => {
        let relPath = f.replace(`${dest}/${stage}/`, "");
        let parts = r.init(relPath.split("/"));
        let dir = pathUtil.dirname(relPath);
        let name = `${dest}/${stage}/${dir}/${apiName}-${env}-${stage}-${parts.join("-")}.js`;
        return name;
    });

    await * r.map(processResource(gateway, region, env, apiName, stage, dest), endpoints);

    return null;

    // Finished Algo
    // 1. check to see if API already exists
    // 2. create restapi if it doesn't already exist
    // 3. get existing resources
    // 4. prune no longer needed resources
    // 5.

    // return new Promise((resolve, reject) => {
    //     resolve({
    //         status: 0,
    //         output: "blah"
    //     });
    // });
};

export default {
    go
};
