import r from "ramda";

export let extract = (spec) => {
    let assoc = r.flip(r.assoc("path"));
    return r.map(assoc({}), r.keys(spec.paths));
};
