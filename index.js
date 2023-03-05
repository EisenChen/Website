import express from "express";
import bcrypt  from "bcrypt";
import cors from 'cors';
import * as db from "./prepareDB.js";
import fs from 'fs'
import yaml from 'yaml'

let app = express();
let PORT = 4567;

const options={
    origin: 'http://localhost:8080'
};
app.use(cors(options));

app.use(express.json());

let __dirname = process.cwd() + "/html";
app.use(express.static(__dirname));

let liveAccounts = [];

let passwordFormat = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[~!@#\$%\^&\*_\-+])(?=.{8,20}$)/;
/*
    ^ = password start postion.
    "(?=.*[a-z])" check at least 1 word from [a-z].
    "(?=.*[A-Z])" check at least 1 word from [A-Z].
    "(?=.*[0-9])" check at least 1 word from [0-9].
    "(?=.*[~!@#\$%\^&\*_\-+])" check at least 1 word from [~!@#\$%\^&\*_\-+].
    "(?=.{8,20}$)" check words length from 8 to 20.
*/

let passwordNotMatchFormat = (password) =>{
    return !password.match(passwordFormat);
}

app.get('/',(req,res)=>{
    res.sendFile('/index.html');
});

app.post('/login', async(req,res)=>{   
    if(Object.keys(req.body).length === 0) return res.status(400).send('Data is empty!');
    let password = await db.getPassword(req.body.account);       
    if(password===undefined) return res.status(200).send('Account not exist!');            
    try{                
        if(await bcrypt.compare(req.body.password,password)){        
            let now = new Date(Date.now()).toString();                      
            db.pushLoginLog(req.body.account, now);
            let idx = liveAccounts.findIndex(ele=>ele===req.body.account);
            if(idx===-1) liveAccounts.push({name:req.body.account,date:now});
            else liveAccounts[idx].date = now;
            return res.redirect('/exam.html');
        }else{
            return res.status(200).send('Login fail!');
        }
    }catch (err){
        return res.status(500).send(err);
    }    
});

app.post('/logout',(req,res)=>{
    liveAccounts.splice(liveAccounts.findIndex(ele=>ele===req.body.account), 1);
    return res.redirect('/index.html');
});

app.get('/register',(req,res)=>{
    res.sendFile(__dirname+'/register.html');
});

app.post('/register',async(req,res)=>{    
    if(Object.keys(req.body).length === 0) return res.status(400).send('Data is empty!');        
    if(passwordNotMatchFormat(req.body.password)) return res.status(403).send('Password not match the format!');     
    if(await db.getAccount(req.body.account)!=undefined) return res.status(409).send('Account exist!');
    try{           
        let name = req.body.account;
        let password = await bcrypt.hash(req.body.password,10);
        await db.register(name,password);
    }catch (err){
        return res.status(500).send(err);
    }
    res.redirect('/index.html');
});

app.get('/live-accounts',(req,res)=>{
    res.send(liveAccounts);
});

app.get('/accounts',(req,res)=>{
    res.send(accounts);    
});

app.get('/loginlog',async(req,res)=>{    
    res.send(await db.getLoginlog());
});

app.get('/questions',async(req,res)=>{
    const file = fs.readFileSync('./exam.yaml','utf8');    
    let questions = yaml.parse(file);
    for(let i in questions) delete questions[i]['answer'];
    let limited = {};
    let candidates = Object.keys(questions);
    let qlen = candidates.length>=10 ? 10 : candidates.length;
    for(let i=0;i<qlen;i++){
        let len = candidates.length;
        let num = Math.floor(Math.random()*len);
        limited[candidates[num]]=questions[candidates[num]];
        candidates.splice(num,1);        
    }        
    res.send(JSON.stringify(limited));
});

app.post('/submitexam',async(req,res)=>{
    const file = fs.readFileSync('./exam.yaml','utf8');    
    let questions = yaml.parse(file);
    let answers = req.body;    
    let score = 0;
    for(let i in answers){  
        if(answers[i]===String(questions[i].answer)) score+=questions[i].score;
    }
    res.send(JSON.stringify({'score':score}));
});

app.listen(PORT);
