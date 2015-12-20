import { color } from "./colors";

export let logger = (level, msg) => {
    console.log(`[${color(level)}] ${msg}`); // eslint-disable-line no-console
};
