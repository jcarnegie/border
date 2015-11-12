import Promise from "bluebird";
import gateway from "../tasks/apigateway";
import zip from "./lambdazip"
import transpile from "./transpile";
import npmInstall from "./npminstall";
import AWS from "aws-sdk";

let createLambdaFunction = (lambda, params) => {
    return new Promise((resolve, reject) => {
        lambda.createFunction(params, (err, data) => {
            resolve(data);
        });
    });
}

let go = async (region, env, apiName, stage, spec, dest) => {
    // Initial Algo
    // 0. Copy + Transpile into dist dir
    // 1. npm install in endpoint dir under dist dir
    // 2. create restapi
    // 3. get resources
    // 4. create resource
    // 5. create method
    // 6. create lambda fn
    // 7. give method permission to execute lambda fn
    // 8. create method integration
    // 9. create deployment
    // 10. point DNS to new deployment URL

    let api = null;
    let resources = null;
    let resource = null;
    let method = null;
    let lambda = null;
    let lambdaZip = null;
    let resp = null;

    lambda = new AWS.Lambda();

    await transpile(stage, dest);
    await npmInstall(`${dest}/${stage}/hello`);

    api = await gateway.createRestapi(region, `${spec.info.title}-${env}`, "");
    resources = await gateway.resources(region, api.id);
    resource = await gateway.createResource(region, api.id, resources[0].id, "hello");
    method = await gateway.updateMethod(region, api.id, resource.id, "GET");
    lambdaZip = await zip(`${dest}/${stage}/hello`);

    resp = await createLambdaFunction(lambda, {
        Code: { ZipFile: lambdaZip }
    });

    return resources;

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
