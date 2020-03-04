/* board js */
'use strict';

// Global variables that will be used for storage
let login = null;
let users = [];

// General purpose user class
function userClass(username, password, id)
{
	this.username = username,
	this.password = password,
	this.id = id,
	this.fullname = null,
	this.email = null,
	this.ownedPieces = [],
	this.isAdmin = false
};

// Test to initialize users
const testUser = new userClass("admin", "admin", 1);
testUser.isAdmin = true;
const testUser2 = new userClass("user", "user", 2);
users.push(testUser);
users.push(testUser2);

const loginButton = document.getElementById('login');
const signupButton = document.getElementById('signup');
const error = document.getElementById('error');

loginButton.addEventListener('click', attemptLogin);
signupButton.addEventListener('click', (e) => {
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
