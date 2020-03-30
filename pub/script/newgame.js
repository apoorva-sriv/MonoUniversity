const createGameBtn = document.querySelector("#newgame");
const joinGameBtn = document.querySelector("#joingame");

const roomNum = document.querySelector("#room-num");

createGameBtn.addEventListener("click", ()=>{

    window.location='./api/createGame';

})

joinGameBtn.addEventListener("click", ()=>{
    if (roomNum.value === "1234567"){
        window.location='./room.html';
    }
})

const profile = document.querySelector("#profile");