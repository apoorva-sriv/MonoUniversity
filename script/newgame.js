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