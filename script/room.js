const leaveBtn = document.querySelector(".leave-btn");
const startBtn = document.querySelector(".start-btn");


leaveBtn.addEventListener("click", () => {
    window.location.replace('./newgame.html');
})

startBtn.addEventListener("click", () => {
    window.location.replace('./board.html');
})

function replaceUserWithUserName()
{
    const username = document.getElementsByTagName("h3"); 
    username[0].innerHTML = localStorage.getItem("username");
}

replaceUserWithUserName();