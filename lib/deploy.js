import Promise from "bluebird";
import gateway from "../lib/apigateway";
import set from "./set";
import zip from "./lambdazip";
import pathUtil from "path";
import transpile from "./transpile";
import npmInstall from "./npminstall";
import AWS from "aws-sdk";
import r from "ramda";

let awaitable      = Promise.promisify;
let lambda         = new AWS.Lambda();
let iam            = new AWS.IAM();
let createFunction = awaitable(lambda.createFunction.bind(lambda));
let addPermission  = awaitable(lambda.addPermission.bind(lambda));
let listFunctions  = awaitable(lambda.listFunctions.bind(lambda));
let getUser        = awaitable(iam.getUser.bind(iam));
let updateFunctionCode = awaitable(lambda.updateFunctionCode.bind(lambda));
let updateFunctionConfiguration = awaitable(lambda.updateFunctionConfiguration.bind(lambda));

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

let specPathsToResources = (spec) => {
    return r.keys(spec.paths);
};

let awsAccountId = async () => {
    let user = await getUser({});
    let accountId = user.User.Arn.split(":")[4];
    return accountId;
};

let createApi = async (region, name, desc) => {
    let apis = await gateway.restapis(region);
    let api = r.find(r.propEq("name", name), apis);
    if (!api) {
        api = await gateway.createRestapi(region, name, desc);
    }
    return api;
};

let createResources = async (region, api, spec) => {
    let deployedResources = await gateway.resources(region, api.id);
    let pathsToDeploy = specPathsToResources(spec);
    let deployedPaths = r.map(r.prop("path"), deployedResources);
    let pathsToCreate = set.difference(new Set(pathsToDeploy), new Set(deployedPaths));

    let createPath = r.curry(async (api, resources, path) => {
        let parts = r.split("/", r.replace(/^\//, "", path));
        let parent = r.join("/", r.prepend("/", r.init(parts)));
        let resource = r.find(r.propEq("path", parent), resources);
        if (!resource) {
            resource = await createPath(api, resources, parent);
        }
        return await gateway.createResource(region, api.id, resource.id, r.last(parts));
    });

    return await * r.map(createPath(api, deployedResources), r.sort(r.gt, [...pathsToCreate]));
};

let listAllFunctions = async (region, nextMarker) => {
    let params  = { MaxItems: 10000 };
    let data    = null;
    let moreFns = [];

    if (nextMarker) params.NextMarker = nextMarker;

    data = await listFunctions({ MaxItems: 10000 });

    if (data.NextMarker)
        moreFns = listAllFunctions(region, data.NextMarker);

    return r.concat(data.Functions, moreFns);
};

let createOrUpdateFunction = async (existingFunctions, params) => {
    let func = r.find(r.propEq("FunctionName", params.FunctionName), existingFunctions);

    if (func) {
        let updateParams = r.clone(params);
        let codeParams = r.pickAll(["FunctionName"], updateParams);
        codeParams = r.merge(codeParams, updateParams.Code);
        Reflect.deleteProperty(updateParams, "Code");
        Reflect.deleteProperty(updateParams, "Runtime");
        await updateFunctionCode(codeParams);
        return await updateFunctionConfiguration(updateParams);
    } else {
        return await createFunction(params);
    }
};

let processResource = r.curry(async (opts, spec) => {
    let accountId       = opts.accountId;
    let lambdaFunctions = opts.lambdaFunctions;
    let defaultRole     = opts.defaultRole;
    let api             = opts.api;
    let resources       = opts.resources;
    let gateway         = opts.gateway;
    let region          = opts.region;
    let env             = opts.env;
    let apiName         = opts.apiName;
    let stage           = opts.stage;
    let dest            = opts.dest;
    let resource        = null;
    let method          = null;
    let lambdaZip       = null;
    let resp            = null;

    try {
        await npmInstall(`${dest}/${stage}${spec.path}/${spec.method}`);
        resource = r.find(r.propEq("path", spec.path), resources);
        method = await gateway.updateMethod(region, api.id, resource.id, spec.method.toUpperCase());
        let functionName = lambdaFunctionName(env, apiName, stage, spec.path, spec.method);
        lambdaZip = await zip(`${dest}/${stage}/hello/get`, pathUtil.basename(functionName));

        let createFuncResp = await createOrUpdateFunction(lambdaFunctions, {
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
            StatementId: `${functionName}-${new Date().getTime()}`,
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
            uri: `arn:aws:apigateway:${region}:lambda:path/2015-03-31/functions/${createFuncResp.FunctionArn}/invocations`
        });
    } catch (e) {
        console.log("error:", e.stack);
        throw e;
    }
});

let endpointModuleFilename = r.curry((apiName, env, stage, dest, f) => {
    let relPath = f.replace(`${dest}/${stage}/`, "");
    let parts = r.init(relPath.split("/"));
    let dir = pathUtil.dirname(relPath);
    let name = `${dest}/${stage}/${dir}/${apiName}-${env}-${stage}-${parts.join("-")}.js`;
    return name;
});

let go = async (region, env, stage, dest, spec) => {
    let apiName           = spec.info.title;
    let apiDesc           = spec.info.title;
    let defaultRole       = spec.info["x-lambda-exec-role"];
    let endpoints         = specPathsToEndpoints(spec.paths);
    let accountId         = await awsAccountId();
    let api               = await createApi(region, `${apiName}-${env}`, apiDesc);
    let resources         = null;
    let lambdaFunctions   = null;
    let filenameFn        = endpointModuleFilename(apiName, env, stage, dest);

    await transpile(`src/${stage}`, `${dest}/${stage}`, filenameFn);
    await createResources(region, api, spec);
    resources = await gateway.resources(region, api.id);
    lambdaFunctions   = await listAllFunctions(region);

    await * r.map(processResource({
        accountId,
        lambdaFunctions,
        defaultRole,
        api,
        resources,
        gateway,
        region,
        env,
        apiName,
        stage,
        dest
    }), endpoints);

    await gateway.deploy(region, api.id, stage);

    return null;
};

export default {
    go
};
