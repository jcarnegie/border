import "colors";

export let color = (str) => {
    switch (str) {
    case "ok":
        return str.green;
    case "warn":
    case "warning":
        return str.yellow;
    case "err":
    case "error":
        return str.red;
    case "fatal":
        return str.black;
    default:
        return str;
    }
};
