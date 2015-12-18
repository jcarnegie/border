import Promise from "bluebird";

let time = () => new Date().getTime();

export default (fn, window) => {
    let queue = [];
    let last  = null;

    return (...args) => {
        return new Promise((resolve, reject) => {
            queue.push({
                resolve,
                reject,
                args: [...args]
            });

            let schedule = () => {
                let now = time();
                let next = (last === null) ? 0 : window + last - now;
                if (next < 0) next = 0;
                last = now;
                setTimeout(exec, next);
            };

            let exec = () => {
                if (queue.length === 0) return;

                let call = queue.shift();
                let p = fn(...call.args);
                p.then(call.resolve);
                p.catch(call.reject);

                schedule();
            };

            schedule();
        });
    };
};
