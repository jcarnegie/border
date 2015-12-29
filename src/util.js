import r from "ramda";

export let mapKeys = r.curry((fn, obj) => {
    let keys = r.keys(obj);
    let vals = r.values(obj);
    return r.zipObj(r.map(fn, keys), vals);
});

export let mapIndexed = r.addIndex(r.map);

export let notNil = r.compose(r.not, r.isNil);
