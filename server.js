const express = require('express');
const app = express();
const {
    metacall_inspect,
    metacall_load_from_memory
} = require('metacall');
const fs = require('fs');
const path = require('path');

// Initialize repls from file
const load = () => new Promise((resolve, reject) => {
    const scriptsPath = path.join(__dirname, 'scripts');

    fs.readdir(scriptsPath, (err, files) => {
        if (err) {
            reject(err);
        }

        // All functions will be stored here
        let functions = {};

        files.forEach(file => {
            try {
                // This imports the scripts (Python, Ruby, C#...)
                const absolute = path.join(scriptsPath, file);
                if (!fs.lstatSync(absolute).isDirectory()) {
                    const handle = require(absolute);
                    functions = { ...functions, ...handle };
                }
            } catch (ex) {
                reject(ex);
            }
        });

        resolve(functions);
    });
});

// Shutdown the server
const close = (server, functions) => {
    Object.keys(functions).forEach(f => {
        if (f.endsWith('_repl_close')) {
            console.log(`Closing ${f}...`);
            functions[f]();
        }
    });
    if (server) {
        console.log('Closing server...');
        return server.close();
    }
};

// Start the server
const start = (functions) => {
    app.use(express.json());

    app.get('/inspect', (req, res) => {
        res.send(metacall_inspect());
    });

    app.post('/eval/:tag', (req, res) => {
        if (!req.params.tag) {
            return res.status(400).send('A tag is required in the URL; i.e: /eval/py.');
        }
        if (!req.body.data) {
            return res.status(400).send('A JSON object like: \'{"data": "module.exports = { f: () => console.log(\\"a\\") }"}\' is required in the body.');
        }
        return res.send(metacall_load_from_memory(req.params.tag, req.body.data));
    });

    app.post('/repl/:tag', async (req, res) => {
        if (!req.params.tag) {
            return res.status(400).send('A tag is required in the URL; i.e: /repl/node.');
        }
        if (!req.body.data) {
            return res.status(400).send('A JSON object like: \'{"data": "console.log(\\"a\\")\\n"}\' is required in the body.');
        }
        const output = await functions[`${req.params.tag}_repl_write`](req.body.data);
        res.send(JSON.stringify(output));
    });

    const server = app.listen(7777, () => {
        console.log('Server listening...');
    });

    app.get('/shutdown', (_, res) => {
        return close(server, functions) ? res.send('Ok') : res.status(500).send('Error');
    });

    return server;
};

module.exports = (async () => {
    let server = null;

    // Load scripts and start the server
    try {
        const functions = await load();
        server = await start(functions);
        // Export a close function to gracefully exit from the server
        return {
            close: () => close(server, functions) ? 'Ok' : 'Error',
        };
    } catch (ex) {
        return console.error(ex);
    }
})();
