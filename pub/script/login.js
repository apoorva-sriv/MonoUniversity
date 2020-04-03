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


// Populate Database with Items if not exists


async function populateItemDB(){
    const url = '/api/shop';

    fetch(url)
    .then((res) => { 
        if (res.status === 200) {
        return res.json() 
    } else {
            alert('Could not get Items')
    }                
    })
    .then(async (json) => {
        if (json.length === 0){
            const items = [
                {name: "cop", description: "Only get two turns in jail for being sent by a tile, four if by chance or community cards" , image: "./img/pieces/cop.png", price: 500},
                {name: "lawyer", description: "Earn three times the get out of jail cards, all expenses increased by 10%" , image: "./img/pieces/lawyer.png", price: 500},
                {name: "veteran", description: "Reduction on money spent on normal tiles by 10%, but collect $150 only from GO ($300) for when landing on it." , image: "./img/pieces/veteran.png", price: 500},
                {name: "worker", description: "Get $250 by passing go, $500 by landing on it, this includes by cards, tax tiles add $25 and $50 respectively." , image: "./img/pieces/worker.png", price: 500},
                {name: "genuis", description: "Unaffected by Utility and TTC tiles, pays 25% more on tax tiles." , image: "./img/pieces/genius.png", price: 500},
                {name: "banker", description: "Immunity to Tax Tiles, but rents are 5% more expensive." , image: "./img/pieces/banker.png", price: 500},
                {name: "investor", description: "You can buy properties early but they cost 50% more early game." , image: "./img/pieces/investor.png", price: 500}
            ]
            console.log("BIGGEST MARKER")
            for (let i = 0; i < items.length; i++){
                await addItem(items[i])
            }
        }
    }).catch((error) => {
        log(error)
    })
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

populateItemDB()