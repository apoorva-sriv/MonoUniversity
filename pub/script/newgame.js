const createGameBtn = document.querySelector("#newgame");
const joinGameBtn = document.querySelector("#joingame");

const roomNum = document.querySelector("#room-num");

createGameBtn.addEventListener("click", ()=>{

    window.location='./createGame.html';

})

joinGameBtn.addEventListener("click", ()=>{
    if (roomNum.value === "1234567"){
        window.location='./room.html';
    }
})

console.log(this.session.username)

const profile = document.querySelector("#profile");


function checkAdmin(username){
    const url = "/api/id/" + username

    fetch(url)
    .then((res) => { 
        if (res.status === 200) {
           return res.json() 
       } else {
            alert('Could not get user')
       }                
    })
    .then((json) => {
        console.log("CHECK")
        if (json.isAdmin){
            const btnDiv = document.querySelector("#buttons")
            const btnAdmin = document.createElement("button")
            btnAdmin.appendChild(document.createTextNode("Admin"))
            btnDiv.appendChild(btnAdmin)
        }
    }).catch((error) => {
        log(error)
    })
}

checkAdmin(this.session.username)

