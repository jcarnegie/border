/* globals console */
export default (test) => {
    return async (done) => {
        try {
            await test();
            done();
        } catch (e) {
            console.error(e.stack);  // eslint-disable-line no-console
            done(e);
        }
    };
};
