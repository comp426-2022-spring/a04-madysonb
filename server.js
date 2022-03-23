// Require Express.js
const express = require('express')
const app = express()
app.use(express.json())
app.use(express.urlencoded({extended: true}))

// require morgan
const morgan = require('morgan')

"use strict";
// Require better-sqlite.
const Database = require('better-sqlite3');
const db = new Database('log.db');

// Require minimist for argument handling
const args = require("minimist")(process.argv.slice(2))
args['port']
args['help']
args['debug']
args['log']

const HTTP_PORT = args.port || 5555
const HELP = args.help
const DEBUG = args.debug
const LOG = args.log

if (HELP) {
    console.log('server.js [options]\n\n    --port	Set the port number for the server to listen on. Must be an integer\n                between 1 and 65535.\n\n    --debug	If set to `true`, creates endlpoints /app/log/access/ which returns\n                a JSON access log from the database and /app/error which throws \n                an error with the message "Error test successful." Defaults to \n                `false`.\n\n    --log	If set to false, no log files are written. Defaults to true.\n                Logs are always written to database.\n\n    --help	Return this message and exit.')
    process.exit(0)
}

// Start an app server
const server = app.listen(HTTP_PORT, () => {
    console.log('App listening on port %PORT%'.replace('%PORT%', HTTP_PORT))
});


// Middleware
app.use( (req, res, next) => {
    let logdata = {
        remoteaddr: req.ip,
        remoteuser: req.user,
        time: Date.now(),
        method: req.method,
        url: req.url,
        protocol: req.protocol,
        httpversion: req.httpVersion,
        secure: req.secure,
        status: res.statusCode,
        referer: req.headers['referer'],
        useragent: req.headers['user-agent']
    }

    const stmt = db.prepare('INSERT INTO accesslog (remoteaddr, remoteuser, time, method, url,  protocol, httpversion, secure, status, referer, useragent) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    const entry = db.run(logdata.remoteaddr.toString(), logdata.remoteuser.toString(), logdata.time.toString(), logdata.method.toString(), logdata.url.toString(), logdata.protocol.toString(), logdata.httpversion.toString(), logdata.secure.toString(), logdata.status.toString(), logdata.referer.toString(), logdata.useragent.toString());
    next();
});

// logging
if (LOG) {
    const accessLog = fs.createWriteStream('access.log', { flags: 'a' });
    app.use(morgan('combined', { stream: accessLog }));
}


// Define default endpoint
app.get('/app/', (req, res) => {
    // Respond with status 200
    res.statusCode = 200;
    // Respond with status message "OK"
    res.statusMessage = 'OK';
    res.writeHead(res.statusCode, { 'Content-Type': 'text/plain' });
    res.end(res.statusCode + ' ' + res.statusMessage)
});

// Response and Request
app.get('/app/flips/:number', (req, res) => {
    const flips = coinFlips(req.params.number)
    const count = countFlips(flips)
    res.status(200).json({ "raw": flips, "summary": count })
});

app.get('/app/flip', (req, res) => {
    res.status(200).json({'flip': coinFlip()})
});

app.get('/app/flip/call/:guess(heads|tails)', (req, res) => {
    const game = flipACoin(req.params.guess)
    res.status(200).json(game)
});

// Default response for any other request
app.use(function (req, res) {
    res.status(404).send('404 NOT FOUND')
});


// Debug endpoints
if (DEBUG) {
    app.get('/app/log/access', (req, res) => {
        if (DEBUG) {
            res.status(200).send(db.prepare('SELECT * FROM accesslog').all())
        }
        else {
            res.status(404).type("text/plain").send('404 NOT FOUND')
        }
    });

    app.get('/app/error', (req, res) => {
        if (DEBUG) {
            throw new Error("Error")
        }
        else {
            res.status(404).type("text/plain").send('404 NOT FOUND')
        }
    });
}


// coin functions
function coinFlip() {
    return Math.random() > .5 ? "heads" : "tails"
}

function coinFlips(flips) {
    let results = []
    let f = 0
    while (f < flips) {
        results[f] = coinFlip()
        f = f + 1
    }
    return results
}


function countFlips(array) {
    let hCount = 0
    let tCount = 0
    for (let f in array) {
        if (array[f] === 'heads') {
            hCount += 1
        } else {
            tCount += 1
        }
    }

    if (tCount == 0) {
        return { 'heads': hCount }
    }

    if (hCount == 0) {
        return { 'tails': tCount }
    }

    return { 'heads': hCount, 'tails': tCount }

}

function flipACoin(call) {
    let flip = coinFlip()
    let result = ""
    if (flip === call) {
        result = 'win'
    } else {
        result = 'lose'
    }

    return { 'call': call, 'flip': flip, 'result': result }

}