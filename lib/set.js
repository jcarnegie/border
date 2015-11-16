
export default {
    union: (a, b) => {
        return new Set([...a, ...b]);
    },

    intersection: (a, b) => {
        return new Set([...a].filter(x => b.has(x)));
    },

    difference: (a, b) => {
        return new Set([...a].filter(x => !b.has(x)));
    }
};
