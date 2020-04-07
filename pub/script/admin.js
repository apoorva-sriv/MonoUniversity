"use strict";
const log = console.log;

function createInfoDiv(labelName, value) {
    value = value.toString();

    const infoItemDiv = document.createElement("div");
    infoItemDiv.classList.add("info-item");

    const label = document.createElement("label");
    label.appendChild(document.createTextNode(labelName));
    infoItemDiv.appendChild(label);
    const input = document.createElement("input");
    input.disabled = true;
    input.value = value;
    // input.appendChild(document.createTextNode(value))
    infoItemDiv.appendChild(input);

    return infoItemDiv;
}

// user = mongodb user object
function createProfileCard(user) {
    const profileCardDiv = document.createElement("div");
    profileCardDiv.classList.add("profile-card");

    //

    const profilePicDiv = document.createElement("div");
    profilePicDiv.classList.add("profile-pic");
    profileCardDiv.appendChild(profilePicDiv);

    const profilePicImg = document.createElement("img");
    profilePicImg.src = user.image;
    profilePicDiv.appendChild(profilePicImg);

    //

    const infoContainerDiv1 = document.createElement("div");
    infoContainerDiv1.classList.add("info-container");
    profileCardDiv.appendChild(infoContainerDiv1);
    const usernameInfoDiv = createInfoDiv("Username", user.user);
    infoContainerDiv1.appendChild(usernameInfoDiv);
    const moneyInfoDiv = createInfoDiv("Money", user.money);
    infoContainerDiv1.appendChild(moneyInfoDiv);

    //
    const infoContainerDiv2 = document.createElement("div");
    infoContainerDiv2.classList.add("info-container");
    profileCardDiv.appendChild(infoContainerDiv2);
    const winsInfoDiv = createInfoDiv("# Wins", user.wins);
    infoContainerDiv2.appendChild(winsInfoDiv);
    const pointsInfoDiv = createInfoDiv("Points", user.points);
    infoContainerDiv2.appendChild(pointsInfoDiv);

    //
    const btnContainerDiv = document.createElement("div");
    btnContainerDiv.classList.add("btn-container");
    profileCardDiv.appendChild(btnContainerDiv);

    const btnEdit = document.createElement("button");
    btnEdit.classList.add("btn-edit");
    btnEdit.appendChild(document.createTextNode("Edit"));
    btnEdit.addEventListener("click", editFunction);
    btnContainerDiv.appendChild(btnEdit);

    const btnSave = document.createElement("button");
    btnSave.classList.add("btn-save");
    btnSave.appendChild(document.createTextNode("Save"));
    btnSave.addEventListener("click", saveFunction);
    btnContainerDiv.appendChild(btnSave);

    return profileCardDiv;
}

function editFunction() {
    const cardDiv = this.parentNode.parentNode;
    const lstInput = cardDiv.querySelectorAll("input");

    for (let i = 1; i < lstInput.length; i++) {
        lstInput[i].disabled = false;
        lstInput[i].classList.add("active-input");
    }
}

function saveFunction() {
    const cardDiv = this.parentNode.parentNode;
    const lstInput = cardDiv.querySelectorAll("input");

    for (let i = 1; i < lstInput.length; i++) {
        lstInput[i].disabled = true;
        lstInput[i].classList.remove("active-input");
    }

    const url = "/api/user";

    let data = {
        username: lstInput[0].value,
        money: parseInt(lstInput[1].value),
        wins: parseInt(lstInput[2].value),
        points: parseInt(lstInput[3].value)
    };

    const request = new Request(url, {
        method: "PATCH",
        body: JSON.stringify(data),
        headers: {
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json"
        }
    });

    fetch(request)
        .then(function (res) {
            if (res.status === 200) {
                console.log("Patch Success");
            } else {
                console.log("Patch Failed");
            }
        })
        .catch(error => {
            console.error(error);
        });
}

function startup() {
    const url = "/api/users";

    fetch(url)
        .then(res => {
            if (res.status === 200) {
                return res.json();
            } else {
                alert("Could not get users");
            }
        })
        .then(json => {
            const profileContainer = document.querySelector("#profiles-container");

            json.map(user => {
                const profileCard = createProfileCard(user);
                profileContainer.appendChild(profileCard);
            });
        })
        .catch(error => {
            console.error(error);
        });
}

startup();

// const infoItemDivUsername = document.createElement("div")
// infoItemDivUsername.classList.add("info-item")
// infoContainerDiv1.appendChild(infoItemDivUsername)
// const labelUsername = document.createElement("label")
// labelUsername.appendChild(document.createTextNode("Username"))
// infoItemDivUsername.appendChild(labelUsername)
// const inputUsername = document.createElement("input")
// labelUsername.appendChild(document.createTextNode(user.user))
// infoItemDivUsername.appendChild(inputUsername)

// const infoItemDivMoney = document.createElement("div")
// infoItemDivMoney.classList.add("info-item")
// infoContainerDiv1.appendChild(infoItemDivMoney)
// const labelMoney = document.createElement("label")
// labelMoney.appendChild(document.createTextNode("Money"))
// infoItemDivMoney.appendChild(labelMoney)
// const inputMoney = document.createElement("input")
// labelMoney.appendChild(document.createTextNode(user.money))
// infoItemDivMoney.appendChild(inputMoney)
