const repl = require('repl');
const {
	/* Readable, */
	Writable
} = require('stream');
let promise, promiseResolve, promiseReject;
const r = repl.start({
    writer: output => {
        promiseResolve(output);
        return output;
    },
    input: process.stdin, // TODO: Maybe we can no-op this too?
    output: new Writable({
        write: (chunk, encding, callback) => {
           setImmediate(callback);
        }
    })
});
module.exports = {
    node_repl_write: async (str) => {
        promise = new Promise((resolve, reject) => {
            promiseResolve = resolve;
            promiseReject = reject;
        });
        r.write(str);
        return await promise;
    },
    node_repl_close: () => {
        return r.close();
    }
};
