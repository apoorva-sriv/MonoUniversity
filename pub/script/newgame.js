const createGameBtn = document.querySelector("#newgame");
const joinGameBtn = document.querySelector("#joingame");

const roomNum = document.querySelector("#room-num");

createGameBtn.addEventListener("click", () => {
    window.location = "/board.html";
});
/*
joinGameBtn.addEventListener("click", ()=>{
    window.location='/room/'+roomNum.value;
})*/

const profile = document.querySelector("#profile");

function checkAdmin() {
    const url = "/api/user";

    fetch(url)
        .then(res => {
            if (res.status === 200) {
                return res.json();
            } else {
                alert("Could not get user");
            }
        })
        .then(json => {
            if (json.isAdmin) {
                const btnDiv = document.querySelector("#buttons");
                const btnAdmin = document.createElement("button");
                btnAdmin.appendChild(document.createTextNode("Admin"));
                btnAdmin.addEventListener("click", () => {
                    window.location = "./admin.html";
                });
                btnDiv.appendChild(btnAdmin);
            }
        })
        .catch(error => {
            console.error(error);
        });
}

checkAdmin();
