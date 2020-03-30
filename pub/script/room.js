const leaveBtn = document.querySelector(".leave-btn");
const startBtn = document.querySelector(".start-btn");


leaveBtn.addEventListener("click", () => {
    window.location.replace('/newgame.html');
})

startBtn.addEventListener("click", () => {
    window.location.replace('/board.html');
})

function replaceUserWithUserName()
{
    const username = document.getElementsByTagName("h3"); 
    username[0].innerHTML = localStorage.getItem("username");
}

function addKickBtn(){
    let allOtherUser = document.querySelectorAll(".cardRightContainer")

    if (localStorage.getItem("username") == "admin"){
        for (let i=0; i < allOtherUser.length; i ++ ){
            const btn = document.createElement("button")
            btn.classList.add("kickBtn")
            btn.appendChild(document.createTextNode("Kick"))
            btn.addEventListener("click", (e) => {
                const toRemove = btn.parentElement.parentElement
                btn.parentElement.parentElement.parentElement.removeChild(toRemove)
            })
            allOtherUser[i].appendChild(btn)
        }
    }
}

addKickBtn();

replaceUserWithUserName();

const getUrl = window.location;
const baseUrl = getUrl .protocol + "//" + getUrl.host + "/" + getUrl.pathname.split('/')[0];
const pathparts = getUrl.pathname.split('/');
const roomId = pathparts[pathparts.length - 1];

const socket = io(baseUrl);
socket.on('newUser', (user) => {
    console.log(user);
});
socket.connect();
socket.emit('identify', roomId);