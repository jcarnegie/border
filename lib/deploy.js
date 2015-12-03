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

let mapSerialAsync = async (fn, list) => {
    if (!list || list.length === 0) return [];
    let result = await fn(r.head(list));
    let tail = r.tail(list);
    let results = [];

    if (tail.length > 0) {
        results = await mapSerialAsync(fn, tail);
        return r.concat([result], results);
    } else {
        return [result];
    }
};


let lambdaFunctionName = (apiSpec, methodSpec) => {
    let basename = r.compose(
        r.replace(/\//g, "-"),
        r.replace(/^\//, ""),
        r.replace(/\}/, "_"),
        r.replace(/\{/, "_"),
    )(methodSpec.path);
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

let createApi = async (logFn, region, name, desc) => {
    let apis = await gateway.restapis(region);
    let api = r.find(r.propEq("name", name), apis);
    if (!api) {
        api = await gateway.createRestapi(region, name, desc);
        logFn("ok", `created API '${name}'`);
    } else {
        logFn("ok", `found existing API '${name}'`);
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
    let swaggerType = (type === "querystring") ? "query" : type;
    let defaultParams = r.path(["info", "x-aws-apigateway", "default-request-params", type], spec) || [];
    let endpointParams = r.map(r.prop("name"), r.filter(r.propEq("in", swaggerType), endpointSpec.parameters || []));
    let paramStrings = r.map(param => `method.request.${type}.${param}`, r.concat(defaultParams, endpointParams));
    let buildHash = (hash, param) => {
        hash[param] = true;
        return hash;
    };
    return r.reduce(buildHash, {}, paramStrings);
});

let methodRequestParams = (spec, endpointSpec) => {
    let headers = mapMethodParams(spec, endpointSpec, "header");
    let querystring = mapMethodParams(spec, endpointSpec, "querystring");
    let paths = mapMethodParams(spec, endpointSpec, "path");
    return {
        ...headers,
        ...querystring,
        ...paths
    };
};

let createOrUpdateMethod = r.curry(async (region, apiId, resources, spec, endpointSpec) => {
    let resource = r.find(r.propEq("path", endpointSpec.path), resources);
    let params = methodRequestParams(spec, endpointSpec);

    try {
        return await gateway.createMethod(region, apiId, resource.id, endpointSpec.method.toUpperCase(), params);
    } catch (e) {
        if (e.message === "Method already exists for this resource") {
            // method already exists so try to update it
            return await gateway.updateMethod(region, apiId, resource.id, endpointSpec.method.toUpperCase(), params);
        }
    }
});

let createGatewayLambdaFunction = r.curry(async (apiSpec, functionName, zip) => {
    return await createOrUpdateFunction(apiSpec.lambdaFunctions, {
        Code: { ZipFile: zip },
        FunctionName: functionName,
        Handler: `${functionName}.${apiSpec.defaultHandler}`,
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

let createOrUpdateIntegration = r.curry(async (apiSpec, methodSpec, resourceId, functionName) => {
    let params = methodRequestParams(apiSpec.spec, methodSpec);
    let functionArn = `arn:aws:lambda:${apiSpec.region}:${apiSpec.accountId}:function:${functionName}`;
    let paramNames = r.map(r.compose(r.last, r.split(".")), r.keys(params));
    let requestTemplates = {};
    let opts = {
        resourceId,
        region: apiSpec.region,
        apiId: apiSpec.api.id,
        method: methodSpec.method.toUpperCase(),
        credentials: apiSpec.defaultCredentials,
        httpMethod: "POST",
        type: "AWS",
        uri: `arn:aws:apigateway:${apiSpec.region}:lambda:path/2015-03-31/functions/${functionArn}/invocations`
    };

    if (paramNames.length > 0) {
        let contentType = "application/json";
        let templates = {};
        r.map(param => templates[param] = `$input.params('${param}')`, paramNames);
        requestTemplates[contentType] = JSON.stringify(templates);
    }

    opts.requestTemplates = requestTemplates;

    try {
        return await gateway.createIntegration(opts);
    } catch (e) {
        return await gateway.updateIntegration(opts);
    }
});

let createOrUpdateMethodResponses = r.curry(async (apiSpec, methodSpec, resourceId) => {
    let method = methodSpec.method.toUpperCase();
    let addCode = (val, key) => r.assoc("statusCode", key, val);
    let responses = r.values(r.mapObjIndexed(addCode, methodSpec.responses));

    let createOrUpdate = r.curry(async (apiSpec, method, resourceId, response) => {
        let headerParam = (header) => `method.response.header.${header}`;
        let addParam = (params, header) => r.assoc(headerParam(header), true, params);
        let responseParameters = r.reduce(addParam, {}, r.keys(response.headers || {}));
        try {
            return await gateway.createMethodResponse(apiSpec.region, apiSpec.api.id, resourceId, method, response.statusCode, responseParameters);
        } catch (e) {
            return await gateway.updateMethodResponse(apiSpec.region, apiSpec.api.id, resourceId, method, response.statusCode, responseParameters);
        }
    });
    return await mapSerialAsync(createOrUpdate(apiSpec, method, resourceId), responses);
});

let createOrUpdateIntegrationResponses = r.curry(async (apiSpec, methodSpec, resourceId) => {
    let method = methodSpec.method.toUpperCase();
    let addCode = (val, key) => r.assoc("statusCode", key, val);
    let responses = r.values(r.mapObjIndexed(addCode, methodSpec.responses));
    let propMatch = (prop, regex) => r.compose(r.not, r.isEmpty, r.match(regex), r.prop(prop));
    let has200RespCode = propMatch("statusCode", /2\d{2}/);

    if (r.filter(has200RespCode, responses).length > 1) {
        throw new Error(`sorry, ${method} ${methodSpec.path} can't have more than one 2xx response`);
    }

    let createOrUpdate = r.curry(async (apiSpec, method, resourceId, response) => {
        let selectionPattern = has200RespCode(response) ? null : response.statusCode;
        try {
            return await gateway.createIntegrationResponse(apiSpec.region, apiSpec.api.id, resourceId, method, response.statusCode, selectionPattern);
        } catch (e) {
            // *gulp*
        }
    });

    return await mapSerialAsync(createOrUpdate(apiSpec, method, resourceId), responses);
});

let zip = r.curry(async (apiSpec, spec, functionName) => {
    return await lambdazip(`${apiSpec.dest}/${apiSpec.stage}${spec.path}/${spec.method}`, functionName);
});

let bindEndpointAndFunction = r.curry(async (logFn, apiSpec, methodSpec) => {
    let resourceId     = r.prop("id", r.find(r.propEq("path", methodSpec.path), apiSpec.resources));
    let functionName   = lambdaFunctionName(apiSpec, methodSpec);
    let createEndpoint = r.composeP(
        () => createOrUpdateIntegrationResponses(apiSpec, methodSpec, resourceId),
        () => createOrUpdateMethodResponses(apiSpec, methodSpec, resourceId),
        () => createOrUpdateIntegration(apiSpec, methodSpec, resourceId, functionName),
        () => addMethodPermission(apiSpec, methodSpec, functionName),
        createGatewayLambdaFunction(apiSpec, functionName),
        zip(apiSpec, methodSpec)
    );
    let result = await createEndpoint(functionName);
    logFn("ok", `deployed ${methodSpec.method.toUpperCase()} ${methodSpec.path}`);
    return result;
});

let endpointModuleFilename = r.curry((apiName, env, stage, dest, filename) => {
    let relPath = filename.replace(`${dest}/${stage}/`, "");
    let parts = r.init(relPath.split("/"));
    let dir = pathUtil.dirname(relPath);
    let basename = `${apiName}-${env}-${stage}-${parts.join("-")}`;
    let name = `${dest}/${stage}/${dir}/${basename.replace(/(\{|\})/g, "_")}.js`;
    return name;
});

let go = r.curry(async (logFn, region, env, stage, dest, spec) => {
    try {
        let accountId         = await awsAccountId();
        let api               = await createApi(logFn, region, `${spec.info.title}-${env}`, spec.info.title);
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
            defaultRole: spec.info["x-aws-apigateway"]["default-role"],
            apiName: spec.info.title,
            name: spec.info.title,
            desc: spec.info.title,
            endpoints: specPathsToEndpoints(spec.paths),
            lambdaFunctions
        };

        await transpile(`src/${stage}`, `${dest}/${stage}`, filenameFn);
        logFn("ok", "transpiled");

        await createResources(region, api, spec);
        logFn("ok", "created missing resources");

        apiSpec.resources = await gateway.resources(region, api.id);
        logFn("ok", "fetched resources");

        // install NPMs for each endpoint lambda function
        await mapSerialAsync(installFunctionModules(dest, stage), apiSpec.endpoints);
        logFn("ok", "installed lambda function NPM modules");

        // Make sure all gateway endpoints are created
        await * r.map(createOrUpdateMethod(region, api.id, apiSpec.resources, spec), apiSpec.endpoints);
        logFn("ok", "created method endpoints");

        // Create lambda functions and bind them to the api gateway endpoint methods
        await * r.map(bindEndpointAndFunction(logFn, apiSpec), apiSpec.endpoints);

        // deploy the api
        await gateway.deploy(region, api.id, stage);
        logFn("ok", "deployed api");
    } catch (e) {
        logFn("error", e);
        throw e;
    }
});

export default {
    createApi,
    createResources,
    listAllFunctions,
    go
};
