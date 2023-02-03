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

(()=>{
    getLiveAccounts();
    getLoginlog();
})();

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