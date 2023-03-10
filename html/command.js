let questionsid = [];

function login(){
    fetch(window.origin+'/login',{
        method:'POST',
        headers: {            
            'content-type': 'application/json'
        },
        body:JSON.stringify({
            account:document.getElementById('account').value,
            password:document.getElementById('password').value
        }),
        redirect: 'follow'
    }).then(res => {
        if (res.redirected) {
            setCookie('account',document.getElementById('account').value);
            window.location.href = res.url;
        }
    }).catch((err) => {
        console.log(err);
    });
}

function register(){    
    fetch(window.origin+'/register',{
        method:'POST',
        headers: {            
            'content-type': 'application/json'
        },
        body:JSON.stringify({
            account:document.getElementById('account').value,
            password:document.getElementById('password').value
        }),
        redirect: 'follow'
    }).then(res => {
        if (res.redirected) {
            window.location.href = res.url;
        }
    }).catch((err) => {
        console.log(err);
    });
}

function cancel(){
    window.location.href='./';
}

function getLiveAccounts(){
    fetch(window.origin+'/live-accounts',{
        method:'GET'       
    }).then(res => {
        return res.json();
    }).then(res=>{
        document.getElementById('live-accounts-number').textContent=res.length;        
        for(let i of res){
            let row = document.createElement('tr');
            let name = document.createElement('td');
            let loginTime = document.createElement('td');
            name.append(i.name);
            name.setAttribute('style','padding:0 20px');
            loginTime.append(i.date);
            row.append(name);                    
            row.append(loginTime);            
            document.getElementById('live-accounts-list').append(row);
        }
    }).catch((err) => {
        console.log(err);
    });
}

function getLoginlog(){
    fetch(window.origin+'/loginlog',{
        method:'GET'       
    }).then(res => {        
        return res.json();
    }).then(res=>{                
        for(let i=0;i<res.length;i++){
            let row = document.createElement('tr');
            let num = document.createElement('td');            
            let name = document.createElement('td');
            let loginTime = document.createElement('td');
            num.append(i+1);
            name.append(res[i].account);
            name.setAttribute('style','padding:0 20px');
            loginTime.append(res[i].date);
            row.append(num);  
            row.append(name);                    
            row.append(loginTime);            
            document.getElementById('loginlog-list').append(row);
        }
    }).catch((err) => {
        console.log(err);
    });
}

function logout(){
    fetch(window.origin+'/logout',{
        method:'POST',
        headers: {            
            'content-type': 'application/json'
        },
        body:JSON.stringify({
            account:getCookie('account'),
        }),       
    }).then(res => {
        if (res.redirected) {
            setCookie('account','',new Date().toUTCString());
            window.location.href = res.url;
        }
    }).catch((err) => {
        console.log(err);
    });
}


function getQuestions(){
    fetch(window.origin+'/questions',{
        method:'GET',        
    }).then(
        res=>res.json()
    ).then(res=>{
        let data = res;        
        for(let num in data){
            let box = document.createElement('div');
            box.setAttribute('style','border:1px solid');
            let image = document.createElement('img');
            image.setAttribute('src',data[num].image);            
            image.setAttribute('style','width:100%');       
            let description = document.createElement('div');
            description.textContent = num+'. '+data[num].description;            
            let answers = document.createElement('div');                    
            for(let i=0;i<data[num].candidates.length;i++){
                let answer = document.createElement('div');
                answer.setAttribute('style','display:flex');
                let choose = document.createElement('input');
                choose.setAttribute('type','radio');
                choose.setAttribute('value',data[num].candidates[i]);                
                choose.setAttribute('name','q' + data[num].number);   
                let text = document.createElement('p');
                text.textContent = data[num].candidates[i];
                answer.append(choose);                
                answer.append(text);
                answers.append(answer);
            }
            questionsid.push('q' + data[num].number);                        
            box.append(image);
            box.append(description);
            box.append(answers);
            document.getElementById('questions').append(box);
        };
    }).catch((err)=>{
        console.log(err);
    });
}

function submitAnswer(){
    let ans = {};
    let n = 1;
    questionsid.forEach((ele)=>{
        let answers = document.getElementsByName(ele);         
        for(let i=0;i<answers.length;i++){                              
            let id = ele.substr(1);
            if(answers[i].checked){
                ans[id]={qnum:n,qid:id,ans:answers[i].value};
                break;
            }
            if(i===answers.length-1) ans[id]={qnum:n,qid:id,ans:''};
        }        
        n++;
    });
    fetch(window.origin+'/submitexam',{
        method:'POST',
        headers: {
            'content-type': 'application/json'
        },
        body:JSON.stringify(ans),
        redirect: 'follow'
    }).then(res => 
        res.json()
    ).then((res)=>{
        let score = document.createElement('div');
        score.textContent = '?????? : ' + res.score;
        score.setAttribute('style','margin:1em')
        //Show Right Answer
        let box = document.createElement('div');
        box.setAttribute('style','border:1px solid;margin:auto;width:fit-content');
        let tb = document.createElement('table');        
        let trh = document.createElement('tr');
        trh.setAttribute('style','border: 1px solid');        
        let th1 = document.createElement('th');
        th1.setAttribute('style','border: 1px solid');        
        let th2 = document.createElement('th');
        th2.setAttribute('style','border: 1px solid');        
        let th3 = document.createElement('th');
        th3.setAttribute('style','border: 1px solid');        
        th1.textContent = "??????";
        th2.textContent = "??????";
        th3.textContent = "????????????";
        trh.append(th1);
        trh.append(th2);
        trh.append(th3);
        tb.append(trh);
        let wrongAnsList = Object.keys(res.wrongAnsList);
        for(let i of wrongAnsList){
            let trd = document.createElement('tr');
            trd.setAttribute('style','border: 1px solid');   
            let td1 = document.createElement('td');
            td1.setAttribute('style','border: 1px solid');               
            let td2 = document.createElement('td');
            td2.setAttribute('style','border: 1px solid;text-decoration:line-through;');   
            let td3 = document.createElement('td');          
            td3.setAttribute('style','border: 1px solid');            
            td1.textContent = res.wrongAnsList[i].qnum + '. ' + res.wrongAnsList[i].description;
            td2.textContent = res.wrongAnsList[i].answer;
            td3.textContent = res.wrongAnsList[i].rightAns;
            trd.append(td1);
            trd.append(td2);
            trd.append(td3);
            tb.append(trd);
        }
        box.append(tb);        
        let content = document.createElement('div');
        content.append(score);
        content.append(box);
        document.getElementById('exam').replaceWith(content);
    }).catch((err) => {
        console.log(err);
    });
    
}

function mockValue(){
    document.getElementById('account').value='account@example.com';
    document.getElementById('password').value='asdASD123!@#';
}

function setCookie(key, val, expire){
    if(expire===undefined){
        d = new Date();
        d.setTime(d.getTime()+ (10*24*60*60*1000));
        expire=d.toUTCString();
    }    
    document.cookie = `${key}=${val};expires=${expire};`;
}

function getCookie(key){
    return document.cookie.match(`(^|;)\\s*${key}\\s*=\\s*([^;]+)`)?.pop() || '';
}