// import r from "ramda";
// import data from "./fixtures/import/resources.json";
//
// let pathExists = (path, obj) => r.not(r.isNil(r.path(path, obj)));
//
// let assocPath = r.curry((path, val, obj) => {
//     let clone = r.clone(obj);
//     r.reduce((parts, part) => {
//         let currentParts = r.append(part, parts);
//         clone = r.assocPath(currentParts, {}, clone);
//         return currentParts;
//     }, [], r.init(path));
//     return r.assocPath(path, val, clone);
// });
//
// let propagate = r.curry((prop, path, obj) => propagateAs(prop, prop, path, obj));
//
// let propagateAs = r.curry((prop, destProp, path, obj) => {
//     if (r.not(pathExists(path, obj))) return obj;
//     let clone = r.clone(obj);
//     let assoc = val => r.assoc(destProp, clone[prop], val);
//     let values = r.map(assoc, r.pathOr([], path, clone));
//     return assocPath(path, values, clone);
// });
//
// let ensurePathArray = r.curry((path, obj) => {
//     if (r.not(pathExists(path, obj))) return obj;
//     let val = r.path(path, obj);
//     return r.assocPath(path, r.is(Array, val) ? val : [val], obj);
// });
//
// describe("Sandbox", () => {
//     it("should experiment", () => {
//         let resources = r.map(r.pick(["id", "path"]));
//         let methodsFull = r.compose(
//             r.flatten,
//             r.map(r.pathOr([], ["_embedded", "resource:methods"])),
//             r.map(propagate("path", ["_embedded", "resource:methods"])),
//             r.map(propagate("id", ["_embedded", "resource:methods"])),
//             r.map(ensurePathArray(["_embedded", "resource:methods"]))
//         );
//         let methods = r.compose(
//             r.map(r.pick(["id", "path", "apiKeyRequired", "authorizationType", "httpMethod", "requestParameters", "requestModels"])),
//             methodsFull
//         );
//         let integrationsFull = r.compose(
//             r.flatten,
//             r.map(r.pathOr([], ["_embedded", "method:integration"])),
//             r.map(propagateAs("httpMethod", "resourceMethod", ["_embedded", "method:integration"])),
//             r.map(propagate("path", ["_embedded", "method:integration"])),
//             r.map(propagate("id", ["_embedded", "method:integration"])),
//             r.map(ensurePathArray(["_embedded", "method:integration"])),
//             methodsFull
//         );
//         let integrations = r.compose(
//             r.map(r.pick(["id", "path", "resourceMethod", "cacheKeyParameters", "cacheNamespace", "httpMethod", "type", "uri"])),
//             integrationsFull
//         );
//         let integrationResponsesFull = r.compose(
//             r.flatten,
//             r.map(r.pathOr([], ["_embedded", "integration:responses"])),
//             r.map(propagate("resourceMethod", ["_embedded", "integration:responses"])),
//             r.map(propagate("path", ["_embedded", "integration:responses"])),
//             r.map(propagate("id", ["_embedded", "integration:responses"])),
//             r.map(ensurePathArray(["_embedded", "integration:responses"])),
//             integrationsFull
//         );
//         let integrationResponses = r.compose(
//             r.map(r.pick(["id", "path", "resourceMethod", "statusCode", "selectionPattern", "responseParameters", "responseTemplates"])),
//             integrationResponsesFull
//         );
//         let responsesFull = r.compose(
//             r.flatten,
//             r.map(r.pathOr([], ["_embedded", "method:responses"])),
//             r.map(propagateAs("httpMethod", "resourceMethod", ["_embedded", "method:responses"])),
//             r.map(propagate("path", ["_embedded", "method:responses"])),
//             r.map(propagate("id", ["_embedded", "method:responses"])),
//             r.map(ensurePathArray(["_embedded", "method:responses"])),
//             methodsFull
//         );
//         let responses = r.compose(
//             r.map(r.pick(["id", "path", "resourceMethod", "statusCode", "responseModels", "responseParameters"])),
//             responsesFull
//         );
//
//         // console.log(JSON.stringify(data[0], null, 4));
//         // console.log(JSON.stringify(r.map(propagate("id", ["_embedded", "resource:methods"]), data), null, 4));
//
//         // console.log(JSON.stringify(resources(data), null, 4));
//         // console.log(JSON.stringify(methods(data), null, 4));
//         // console.log(JSON.stringify(integrations(data), null, 4));
//         // console.log(JSON.stringify(integrationResponses(data), null, 4));
//
//         console.log(JSON.stringify(responses(data), null, 4));
//
//         // console.log(JSON.stringify(flatten(resources[0]), null, 4));
//     });
//
//     // it("should do another experiment", () => {
//     //     let data = [{
//     //         id: "x",
//     //         a: [
//     //             {x: 0},
//     //             {y: 0},
//     //             {z: 0}
//     //         ]
//     //     }, {
//     //         id: "y",
//     //         a: [
//     //             { b: [{}, {}]},
//     //             {},
//     //             {}
//     //         ],
//     //         a: {
//     //             b: {}
//     //         }
//     //     }];
//     //
//     //
//     //
//     //     console.log(JSON.stringify(r.map(propagate("id", ["a", "b"], data)), null, 4));
//     //
//     //     // let res = r.map(propagate("id", ["a"]), data);
//     //
//     //     // console.log(JSON.stringify(res, null, 4));
//     // });
// });
