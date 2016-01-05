import r from "ramda";

export let pathExists = (path, obj) => r.not(r.isNil(r.path(path, obj)));

export let assocPath = r.curry((path, val, obj) => {
    let clone = r.clone(obj);
    r.reduce((parts, part) => {
        let currentParts = r.append(part, parts);
        clone = r.assocPath(currentParts, {}, clone);
        return currentParts;
    }, [], r.init(path));
    return r.assocPath(path, val, clone);
});

export let propagate = r.curry((prop, path, obj) => propagateAs(prop, prop, path, obj));

export let propagateAs = r.curry((prop, destProp, path, obj) => {
    if (r.not(pathExists(path, obj))) return obj;
    let clone = r.clone(obj);
    let assoc = val => r.assoc(destProp, clone[prop], val);
    let values = r.map(assoc, r.pathOr([], path, clone));
    return assocPath(path, values, clone);
});

export let ensurePathArray = r.curry((path, obj) => {
    if (r.not(pathExists(path, obj))) return obj;
    let val = r.path(path, obj);
    return r.assocPath(path, r.is(Array, val) ? val : [val], obj);
});

export let setIf = r.curry((pred, prop, val, obj) => {
    if (pred(obj)) {
        return r.assoc(prop, val, obj);
    } else {
        return obj;
    }
});

export let propIsNil = r.curry((prop, obj) => {
    return r.isNil(r.prop(prop, obj));
});
