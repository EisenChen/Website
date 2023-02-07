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
        let data = {
            1:{
                'description':'1+1=?',
                'answers':[1,2,3,4]
            },
            2:{
                'description':'2+2=?',
                'answers':[1,2,3,4]
            }
        };
        for(let num in data){
            let box = document.createElement('div');
            box.setAttribute('style','border:1px solid');
            let description = document.createElement('div');
            description.textContent = num+'. '+data[num].description;
            let answers = document.createElement('div');                    
            for(let i=0;i<data[num].answers.length;i++){
                let answer = document.createElement('div');
                answer.setAttribute('style','display:flex');
                let choose = document.createElement('input');
                choose.setAttribute('type','radio');
                choose.setAttribute('value',i+1);                
                choose.setAttribute('name','q'+num);   
                let text = document.createElement('p');
                text.textContent = data[num].answers[i];
                answer.append(choose);                
                answer.append(text);
                answers.append(answer);
            }
            questionsid.push('q'+num);            
            box.append(description);
            box.append(answers);
            document.getElementById('questions').append(box);
        };
    }).catch((err)=>{
        console.log(err);
    });
    console.log(questionsid);
}

function submitAnswer(){
    let ans = {};
    questionsid.forEach((ele)=>{
        let answers = document.getElementsByName(ele);
        answers.forEach((ans)=>{
            if(ans.checked) ans[ele]=ans.value;
        });
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
        score.textContent = '分數 : ' + res.score;
        score.setAttribute('style','margin:1em')
        document.getElementById('exam').replaceWith(score);
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