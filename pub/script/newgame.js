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

// Audio
const audio = document.querySelector('#audio');
const audioIcon = document.querySelector("#audioIcon");
audioIcon.addEventListener('click', function toggleAudio(){
    if (audio.paused || audio.muted)   // audio.paused for the first time the page is loaded (in Chrome at least, where autoplay is disabled)
    {
        audioIcon.src = "img/audioIcon.png";
        audio.play();
        audio.muted = false;
    }
    else {
        audioIcon.src = "img/audioIconMuted.png";
        audio.muted = true;
    }
});