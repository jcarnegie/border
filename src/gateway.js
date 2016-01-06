import r from "ramda";
import AWS from "aws-sdk";

export let gatewayMethods = region => {
    let api = new AWS.APIGateway({ region });

    let methods = [
        "createResource",
        "putMethod",
        "updateMethod",
        "putMethodResponse",
        "updateMethodResponse"
    ];

    let addMethod = r.curry((api, methods, method) => {
        methods[method] = api[method].bind(api);
        return methods;
    });

    return r.reduce(addMethod(api), {}, methods);
};
