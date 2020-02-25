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
        window.location.replace('./newgame.html');
    } else {
        errorMessage('Invalid username or password');
    }
}

function authenticate(user, pass){
    //TODO make request to backend
    return user === "tenkai";
}

function errorMessage(m){
    error.innerText = m;
}
