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

    if(authenticate(user, pass)){
		localStorage.setItem('username', login.username);
		localStorage.setItem('admin', login.isAdmin);
		window.location.replace('./newgame.html');
    } else {
        errorMessage('Invalid username or password');
    }
}

function authenticate(user, pass){
    //TODO make request to backend
	for (let i = 0; i < users.length; i++)
	{
		if (users[i].username == user)
		{
			if (users[i].password == pass)
			{
				login = users[i];
				return true;
			}
		}
	}
	return false;
}

function errorMessage(m){
    error.innerText = m;
}
