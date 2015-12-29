import r from "ramda";
import pathUtil from "path";
import { mapKeys, notNil } from "../../lib/util";

let reducer = r.curry((spec, resources, path) => {
    if (!resources[path]) resources[path] = {};
    let resource = resources[path];

    resource.path = path;
    resource.pathPart = pathUtil.basename(path);
    resource.methods = mapKeys(r.toUpper, spec.paths[path]);
    resource.methods = r.mapObjIndexed((method, httpMethod) => {
        let authType = r.path(["x-aws-apigateway", "authorizationType"]);
        let apiKeyReq = r.path(["x-aws-apigateway", "apiKeyRequired"]);
        let integrationMethod = r.path(["x-aws-apigateway", "integrationHttpMethod"]);
        let integrationType = r.path(["x-aws-apigateway", "integrationType"]);

        method.httpMethod = httpMethod;
        method.authorizationType = authType(method) || "NONE";
        method.apiKeyRequired = apiKeyReq(method) || false;

        method.params = r.reduce((params, param) => {
            let type = (param.in === "query") ? "querystring" : param.in;
            params[type] = r.append(param.name, r.or(params[type], []));
            return params;
        }, {}, r.or(method.parameters, []));

        method.integration = {
            // default is lambda, which is a POST
            httpMethod: integrationMethod(method) || "POST",
            type: integrationType(method) || "AWS",
            requestTemplates: {
                "application/json": "{" + r.join(",", r.reduce((arr, param) => {
                    return r.append(`"${param}":"$input.params('${param}')"`, arr);
                }, [], r.flatten(r.values(method.params)))) + "\"body\":$input.json('$')}"
            },
            responses: r.reduce((responses, statusCode) => {
                return r.append({
                    statusCode,
                    responseTemplates: { "application/json": null },
                    selectionPattern: (statusCode === "200") ? null : statusCode
                }, responses);
            }, [], r.keys(method.responses))
        };

        method.responses = r.reduce((responses, statusCode) => r.append({ statusCode }, responses), [], r.keys(method.responses));

        return method;
    }, resource.methods);

    let methodProps = [
        "apiKeyRequired",
        "authorizationType",
        "httpMethod",
        "params",
        "integration",
        "responses"
    ];
    resource.methods = r.map(r.pick(methodProps), resource.methods);

    return resources;
});

export default (swaggerSpec) => {
    let reduced = r.reduce(
        reducer(swaggerSpec),
        {},
        r.keys(swaggerSpec.paths)
    );

    // fill in resource path parts
    let fillIn = r.curry((reduced, resources, path) => {
        let pathParts = r.tail(r.split("/", path));
        let fillInResource = r.curry((resources, parts, pathPart) => {
            let currentParts = r.append(pathPart, parts);
            let path = `/${r.join("/", currentParts)}`;
            let exists = notNil(reduced[path]);
            resources[path] = (exists) ? reduced[path] : {
                path,
                pathPart: pathUtil.basename(path)
            };
            return currentParts;
        });
        r.reduce(fillInResource(resources), [], pathParts);

        return resources;
    });

    return r.reduce(fillIn(reduced), {}, r.keys(reduced));
};
