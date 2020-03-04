const leaveBtn = document.querySelector(".leave-btn");
const startBtn = document.querySelector(".start-btn");


leaveBtn.addEventListener("click", () => {
    window.location.replace('./newgame.html');
})

startBtn.addEventListener("click", () => {
    window.location.replace('./board.html');
})
