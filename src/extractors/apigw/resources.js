import r from "ramda";
export let extract = r.map(r.pick(["id", "path"]));
