const leaveBtn = document.querySelector(".leave-btn");
const startBtn = document.querySelector(".start-btn");
const roomNum = document.getElementById('roomHeading').getElementsByClassName('roomNum')[0];
const waitingRoom = document.getElementById('playerCards');

const getUrl = window.location;
const baseUrl = getUrl .protocol + "//" + getUrl.host + "/" + getUrl.pathname.split('/')[0];
const pathparts = getUrl.pathname.split('/');
const roomId = pathparts[pathparts.length - 1];
roomNum.innerText = roomId;

const socket = io(baseUrl);

let users = [];

leaveBtn.addEventListener("click", () => {
    socket.emit("leave");
    window.location.replace('/newgame.html');
});

startBtn.addEventListener("click", () => {
    socket.emit("startRequest");
});

function replaceUserWithUserName()
{
    const username = document.getElementsByTagName("h3"); 
    username[0].innerHTML = localStorage.getItem("username");
}

function addKickBtn(){
    let allOtherUser = document.querySelectorAll(".cardRightContainer");

    if (localStorage.getItem("username") === "admin"){
        for (let i=0; i < allOtherUser.length; i ++ ){
            const btn = document.createElement("button");
            btn.classList.add("kickBtn");
            btn.appendChild(document.createTextNode("Kick"));
            btn.addEventListener("click", (e) => {
                e.preventDefault();
                const toRemove = btn.parentElement.parentElement;
                btn.parentElement.parentElement.parentElement.removeChild(toRemove);
            });
            allOtherUser[i].appendChild(btn);
        }
    }
}

function renderUser(user){
    waitingRoom.innerHTML += `
            <div class="playerCard">
                <div class="cardContainers cardLeftContainer">
                    <img class="cardProfilePic" src="/${user.image}"/>
                </div>
                 
                <div class="cardContainers cardCenterContainer">
                    <h3>${user.user}</h3>
                    <h4>Number of Wins: ${user.wins}</h4>
                </div>
            </div>
        `
}


function renderUsers(){
    waitingRoom.innerHTML = "";
    for(let i=0; i<users.length; i++){
        renderUser(users[i]);
    }
}

addKickBtn();

replaceUserWithUserName();

socket.on('newUser', (user) => {
    users.push(user);
    renderUsers();
});

socket.on('playerLeave', (pid) => {
    for(let i=0; i<users.length; i++){
        if(users[i]._id == pid){
            users.pop(i);
            break;
        }
    }
    renderUsers();
});
socket.on("startGame", () => {
    console.log("Game start");
    window.location.replace("/board.html");
});
socket.connect();
socket.emit('identify', roomId);
socket.on("identifyAccept", (res) => {
    fetch('/api/room/'+roomId).then((res) => { 
        if (res.status === 200) {
           return res.json() 
       } else {
            alert('Could not get users')
       }                
    }).then((res) => {
        users = res.users;
        renderUsers();
    }).catch((err) => {
        console.log(err);
    });
});
