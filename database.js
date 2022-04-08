"use strict";
// Require better-sqlite.
const Database = require('better-sqlite3');
const db = new Database('log.db');


const stmt = db.prepare(`SELECT name FROM sqlite_master WHERE type='table' and name='accesslog';`);
let row = stmt.get();

// init db
if (row === undefined) {
    console.log('Log database is empty. Creating log database...')

    const sqlInit = `
        CREATE TABLE accesslog ( 
          id INTEGER PRIMARY KEY, 
          remoteaddr VARCHAR, 
          remoteuser VARCHAR, 
          time NUMERIC, 
          method VARCHA, 
          url VARCHAR, 
          protocol VARCHAR, 
          httpversion VARCHAR,   
          status INTEGER, 
          referer VARCHAR, 
          useragent VARCHAR );
    `;

    db.exec(sqlInit);
} else {
    console.log("Database exists");
}

module.exports = db;