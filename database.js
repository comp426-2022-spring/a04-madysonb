"use strict";
// Require better-sqlite.
const Database = require('better-sqlite3');
const db = new Database('log.db');


const stmt = db.prepare(`SELECT name FROM sqlite_master WHERE type='table' and name='accesslog'`);
let row = stmt.get();

// init db
if (row === undefined) {
    console.log('Log database appears to be empty. Creating log database...')

    const sqlInit = `
        CREATE TABLE accesslog (
            id INTEGER PRIMARY KEY
            remoteaddr VARCHAR,
            remoteuser VARCHAR,
            time VARCHAR, 
            method VARCHAR,
            url VARCHAR,
            protocol VARCHAR,
            httpversion NUMERIC,
            secure INTEGER,
            status INTEGER,
            referer VARCHAR,
            useragent VARCHAR
        );
        `

    db.exec(sqlInit);
}

module.exports = db