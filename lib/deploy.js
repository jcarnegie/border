import Promise from "bluebird";
import gateway from "../lib/apigateway";
import set from "./set";
import lambdazip from "./lambdazip";
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

let lambdaFunctionName = (apiSpec, methodSpec) => {
    let basename = methodSpec.path.replace(/^\//, "").replace(/\//g, "-");
    return `${apiSpec.apiName}-${apiSpec.env}-${apiSpec.stage}-${basename}-${methodSpec.method}`;
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
    let root          = r.find(r.propEq("path", "/"), deployedResources);

    let createPath = r.curry(async (api, resources, parent, path) => {
        // base case
        if (parent.path === path) return;

        // general case
        let currentPartFromPath = r.compose(
            r.head,
            r.split("/"),
            r.replace(/^\//, ""),
            r.replace(parent.path, "")
        );

        let currentPart = currentPartFromPath(path);
        let currentPath = pathUtil.join(parent.path, currentPart);
        let resource = r.find(r.propEq("path", currentPath), resources);

        if (resource) {
            await createPath(api, resources, resource, path);
        } else {
            resource = await gateway.createResource(region, api.id, parent.id, currentPart);
            await createPath(api, resources, resource, path);
        }
    });

    return await * r.map(createPath(api, deployedResources, root), r.sort(r.gt, [...pathsToCreate]));
};

let listAllFunctions = async (region, nextMarker) => {
    let params  = { MaxItems: 10000 };
    let data    = null;

    if (nextMarker) params.NextMarker = nextMarker;

    data = await listFunctions(params);

    if (data.NextMarker) {
        let moreFns = await listAllFunctions(region, data.NextMarker);
        return r.concat(data.Functions, moreFns);
    } else {
        return data.Functions;
    }
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

let installFunctionModules = r.curry(async (dest, stage, spec) => {
    return await npmInstall(`${dest}/${stage}${spec.path}/${spec.method}`);
});

let mapMethodParams = r.curry((spec, endpointSpec, type) => {
    let defaultParams = r.path(["info", "x-apigateway", "default-request-params", type], spec) || [];
    let endpointParams = r.path(["x-apigateway", "request-params", type], endpointSpec) || [];
    let paramStrings = r.map(h => `method.request.${type}.${h}`, r.concat(defaultParams, endpointParams));
    return r.reduce((hash, param) => { hash[param] = true; return hash; }, {}, paramStrings);
});

let updateMethod = r.curry(async (region, apiId, resources, spec, endpointSpec) => {
    let resource = r.find(r.propEq("path", endpointSpec.path), resources);
    let headers = mapMethodParams(spec, endpointSpec, "header");
    let querystring = mapMethodParams(spec, endpointSpec, "querystring");
    let paths = mapMethodParams(spec, endpointSpec, "path");

    return await gateway.updateMethod(region, apiId, resource.id, endpointSpec.method.toUpperCase(), {
        ...headers,
        ...querystring,
        ...paths
    });
});

let createGatewayLambdaFunction = r.curry(async (apiSpec, name, zip) => {
    return await createOrUpdateFunction(apiSpec.lambdaFunctions, {
        Code: { ZipFile: zip },
        FunctionName: name,
        Handler: apiSpec.defaultHandler,
        Role: `arn:aws:iam::${apiSpec.accountId}:role/${apiSpec.defaultRole}`,
        Runtime: "nodejs"
    });
});

let addMethodPermission = r.curry(async (apiSpec, methodSpec, functionName) => {
    return await addPermission({
        Action: "lambda:InvokeFunction",
        FunctionName: functionName,
        Principal: "apigateway.amazonaws.com",
        StatementId: `${functionName}-${new Date().getTime()}`,
        SourceArn: `arn:aws:execute-api:${apiSpec.region}:${apiSpec.accountId}:${apiSpec.api.id}/*/${methodSpec.method.toUpperCase()}${methodSpec.path}`
    });
});

let createIntegration = r.curry(async (apiSpec, methodSpec, resourceId, functionName) => {
    let functionArn = `arn:aws:lambda:${apiSpec.region}:${apiSpec.accountId}:function:${functionName}`;
    return await gateway.createIntegration({
        region: apiSpec.region,
        apiId: apiSpec.api.id,
        resourceId,
        method: methodSpec.method.toUpperCase(),
        credentials: apiSpec.defaultCredentials,
        httpMethod: "POST",
        type: "AWS",
        uri: `arn:aws:apigateway:${apiSpec.region}:lambda:path/2015-03-31/functions/${functionArn}/invocations`
    });
});

let zip = r.curry(async (apiSpec, spec, functionName) => {
    return await lambdazip(`${apiSpec.dest}/${apiSpec.stage}${spec.path}/${spec.method}`, functionName);
});

let bindEndpointAndFunction = r.curry(async (apiSpec, methodSpec) => {
    let resId          = r.prop("id", r.find(r.propEq("path", methodSpec.path), apiSpec.resources));
    let functionName   = lambdaFunctionName(apiSpec, methodSpec);
    let createEndpoint = r.composeP(
        () => createIntegration(apiSpec, methodSpec, resId, functionName),
        () => addMethodPermission(apiSpec, methodSpec, functionName),
        createGatewayLambdaFunction(apiSpec, functionName),
        zip(apiSpec, methodSpec)
    );

    return await createEndpoint(functionName);
});

let endpointModuleFilename = r.curry((apiName, env, stage, dest, filename) => {
    let relPath = filename.replace(`${dest}/${stage}/`, "");
    let parts = r.init(relPath.split("/"));
    let dir = pathUtil.dirname(relPath);
    let name = `${dest}/${stage}/${dir}/${apiName}-${env}-${stage}-${parts.join("-")}.js`;
    return name;
});

let go = r.curry(async (region, env, stage, dest, spec) => {
    try {
        let accountId         = await awsAccountId();
        let api               = await createApi(region, `${spec.info.title}-${env}`, spec.info.title);
        let lambdaFunctions   = await listAllFunctions(region);
        let filenameFn        = endpointModuleFilename(spec.info.title, env, stage, dest);

        let apiSpec = {
            region,
            env,
            stage,
            dest,
            spec,
            accountId,
            api,
            defaultCredentials: null,
            defaultHandler: "handler",
            defaultRole: spec.info["x-lambda-exec-role"],
            apiName: spec.info.title,
            name: spec.info.title,
            desc: spec.info.title,
            defaultRole: spec.info["x-lambda-exec-role"],
            endpoints: specPathsToEndpoints(spec.paths),
            lambdaFunctions
        };

        await transpile(`src/${stage}`, `${dest}/${stage}`, filenameFn);
        await createResources(region, api, spec);

        let resources = await gateway.resources(region, api.id);
        apiSpec.resources = resources;

        // install NPMs for each endpoint lambda function
        await * r.map(installFunctionModules(dest, stage), apiSpec.endpoints);

        // Make sure all gateway endpoints are created
        await * r.map(updateMethod(region, api.id, resources, spec), apiSpec.endpoints);

        // Create lambda functions and bind them to the api gateway endpoint methods
        await * r.map(bindEndpointAndFunction(apiSpec), apiSpec.endpoints);

        // deploy the api
        await gateway.deploy(region, api.id, stage);
    } catch (e) {
        console.error("error:", e.stack);
        throw e;
    }
});

export default {
    createApi,
    createResources,
    listAllFunctions,
    go
};
