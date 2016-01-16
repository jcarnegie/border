import r from "ramda";

export let mapKeys = r.curry((fn, obj) => {
    let keys = r.keys(obj);
    let vals = r.values(obj);
    return r.zipObj(r.map(fn, keys), vals);
});

export let replaceKey = r.curry((origKey, newKey, obj) => {
    let value = r.path([origKey], obj);
    let updated = r.assoc(newKey, value, obj);
    return r.dissoc(origKey, updated);
});

export let renameKey = replaceKey;

export let renameProp = r.curry((oldProp, newProp, obj) => {
    return r.dissoc(
        oldProp,
        r.assoc(newProp, r.path(oldProp, obj), obj)
    );
});

export let mapIndexed = r.addIndex(r.map);

export let notNil = r.compose(r.not, r.isNil);

export let propNotEq = r.curry(r.compose(r.not, r.propEq));

export let compareProps = r.curry((props, a, b) => r.equals(r.pick(props, a), r.pick(props, b)));

export let cmpObj = r.curry((a, b, prop) => a[prop] === b[prop]);

export let cmpObjProps = r.curry((props, a, b) => {
    let vals = r.map(cmpObj(a, b), props);
    return r.all(r.equals(true), vals);
});

export let mapSerialAsync = r.curry(async (fn, list) => {
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
});

export let reduceAsync = r.curry(async (fn, acc, list) => {
    if (r.isEmpty(list)) return acc;
    acc = await fn(acc, r.head(list));
    let tail = r.tail(list);
    if (r.isEmpty(tail)) {
        return acc;
    } else {
        return await reduceAsync(fn, acc, tail);
    }
});

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


export let removeLeadingSlash = r.replace(/^\//, "");

export let subpaths = (paths) => {
    let splitPath = r.compose(
        r.split("/"),
        removeLeadingSlash
    );

    let expander = r.reduce((paths, part) => {
        let parts = r.filter(notNil, [r.last(paths), part]);
        let path = `/${r.join("/", parts)}`;
        let newPaths = r.append(path, paths);
        return newPaths;
    }, []);

    let expand = r.compose(
        r.sort(r.gt),
        r.uniq,
        r.map(r.replace(/^\/+/, "/")),
        r.flatten,
        r.map(expander),
        r.map(splitPath)
    );

    return expand(paths);
};

export let updatedSetElements = (matchPred, diffPred, a, b) => {
    let sharedElements = r.intersectionWith(matchPred, a, b);
    let diff = r.differenceWith(diffPred, sharedElements, b);
    return diff;
};
