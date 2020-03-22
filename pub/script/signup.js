/* board js */
'use strict';

// Test to initialize users
const signupButton = document.getElementById('signup');
const error = document.getElementById('error');

signupButton.addEventListener('click', attemptSignup);

function attemptSignup(e){
    e.preventDefault();
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;
    const cpass = document.getElementById('confirmPassword').value;
    if(pass !== cpass){
        errorMessage("Passwords do not match");
        return;
    }
    $.post("api/signup", {user: user, password: pass}).done(() => {
        window.location.replace('./index.html');
    }).fail((message) => {
        errorMessage(message.responseText);
    });

}

function errorMessage(m){
    error.innerText = m;
}
