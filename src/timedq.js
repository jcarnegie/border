import Promise from "bluebird";

export default (fn, window) => {
    let queue = [];
    let scheduled = false;

    return (...args) => {
        return new Promise((resolve, reject) => {
            queue.push({
                resolve,
                reject,
                args: [...args]
            });

            let exec = () => {
                if (queue.length === 0) {
                    scheduled = false;
                } else {
                    let call = queue.shift();
                    fn(...call.args)
                        .then(call.resolve)
                        .catch(call.reject);
                    setTimeout(exec, window);
                }
            };

            if (!scheduled) {
                setTimeout(exec, 0);
                scheduled = true;
            }
        });
    };
};
