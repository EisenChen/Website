import sqlite3 from 'sqlite3';
const db = new sqlite3.Database('serverDB');

async function init() {
    await resetDB();
    await buildTable();
}

function resetDB() {
    return new Promise((resolve, reject) => {
        db.all("SELECT name FROM sqlite_schema WHERE type ='table' AND name NOT LIKE 'sqlite_%'", (err, rows) => {
            rows.forEach((row) => {
                db.run("DROP TABLE" + " " + row.name);
            });
            setTimeout(() => { resolve(); }, 1000);
        });
    });
}

function buildTable() {
    return new Promise((resolve, reject) => {
        db.run("CREATE TABLE accounts(number INTEGER NOT NULL PRIMARY KEY,\
                                            name TEXT ,\
                                            password TEXT)");
        db.run("CREATE TABLE loginlog(number INTEGER NOT NULL PRIMARY KEY,\
                                            account TEXT ,\
                                            date TEXT)");
        setTimeout(() => { resolve(); }, 1000);
    });
}

export function register(name, password) {    
    return db.run(`INSERT INTO accounts (name, password) VALUES('${name}','${password}')`);
}

export function getAccount(name){
    return new Promise((resolve,reject)=>{
        db.get(`SELECT name FROM accounts WHERE name = '${name}'`,(err,res)=>{                     
            resolve(res);        
        })
    });
}

export function getPassword(name) {    
    return new Promise((resolve,reject)=>{
        db.get(`SELECT password FROM accounts WHERE name = '${name}'`,(err,res)=>{                     
            resolve(res.password);        
        })
    });
}

export function pushLoginLog(name,date){
    return db.run(`INSERT INTO loginlog (account, date) VALUES('${name}','${date}')`);
}

export function getLoginlog(){
    return new Promise((resolve,reject)=>{
        db.all(`SELECT * FROM loginlog ORDER BY number DESC`,(err,rows)=>{            
            resolve(rows);
        });        
    });
}