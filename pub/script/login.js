/* board js */
'use strict';

const loginButton = document.getElementById('login');
const signupButton = document.getElementById('signup');
const error = document.getElementById('error');

loginButton.addEventListener('click', attemptLogin);
signupButton.addEventListener('click', (e) => {
    e.preventDefault();
	window.location.replace('./signup.html');
});

function attemptLogin(e){
    e.preventDefault();
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;
    if(user === "" || pass === ""){
        errorMessage('Username and password cannot be blank');
        return
    }

    authenticate(user, pass).done(() => {
        setUser(user);
		window.location.replace('./newgame.html');
    }).fail(() => {
        errorMessage('Invalid username or password');
    });
}

function authenticate(user, pass){
	return $.post("api/login", {user: user, password: pass});
}

function errorMessage(m){
    error.innerText = m;
}

async function addItem(data){
    const url = "/api/shop/item"

    const request = new Request(url, {
        method: 'POST', 
        body: JSON.stringify(data), 
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },
    });

    await fetch(request)
    .then(function(res) {
        if (res.status === 200) {
            console.log('Item Posted')           
        } else {
            console.log("Item Post Failed")
        }
    }).catch((error) => {
        log(error)
    })
}

