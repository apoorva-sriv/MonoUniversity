
function createInfoDiv(labelName, value){

    value = value.toString()

    const infoItemDiv = document.createElement("div")
    infoItemDiv.classList.add("info-item")
    
    const label = document.createElement("label")
    label.appendChild(document.createTextNode(labelName))
    infoItemDiv.appendChild(label)
    const input = document.createElement("input")
    input.disabled = true
    input.appendChild(document.createTextNode(value))
    infoItemDiv.appendChild(input)

    return infoItemDiv
}


// user = mongodb user object
function createProfileCard(user){

    const profileCardDiv = document.createElement("div")
    profileCardDiv.classList.add("profile-card")

    // 

    const profilePicDiv = document.createElement("div")
    profilePicDiv.classList.add("profile-pic")
    profileCardDiv.appendChild(profilePicDiv)

    const profilePicImg = document.createElement("img")
    profilePicImg.src = user.image
    profilePicDiv.appendChild(profilePicImg)

    //

    const infoContainerDiv1 = document.createElement("div")
    infoContainerDiv1.classList.add("info-container")
    profileCardDiv.appendChild(infoContainerDiv1)
    const usernameInfoDiv = createInfoDiv("Username", user.user )
    infoContainerDiv1.appendChild(usernameInfoDiv)
    const moneyInfoDiv = createInfoDiv("Money", user.money)
    infoContainerDiv1.appendChild(moneyInfoDiv)

    //
    const infoContainerDiv2 = document.createElement("div")
    infoContainerDiv2.classList.add("info-container")
    profileCardDiv.appendChild(infoContainerDiv2)
    const winsInfoDiv = createInfoDiv("# Wins", user.wins)
    infoContainerDiv2.appendChild(winsInfoDiv)
    const pointsInfoDiv = createInfoDiv("Points", user.points)
    infoContainerDiv2.appendChild(pointsInfoDiv)

    //
    const btnContainerDiv = document.createElement("div")
    btnContainerDiv.classList.add("btn-container")
    profileCardDiv.appendChild(btnContainerDiv)
    const btnEdit = document.createElement("button")
    btnEdit.classList.add("btn-edit")
    btnContainerDiv.appendChild(btnEdit)
    const btnSave = document.createElement("button")
    btnSave.classList.add("btn-save")
    btnContainerDiv.appendChild(btnSave)
}

function startup(){

    const url = '/api/users';

    fetch(url)
    .then((res) => { 
        if (res.status === 200) {
           return res.json() 
       } else {
            alert('Could not get users')
       }                
    })
    .then((json) => {
        profileContainer = document.querySelector('#profile-container')
    
        json.map((user) => {
            const profileCard = createProfileCard(user)
            profileContainer.appendChild(profileCard)
        })
    }).catch((error) => {
        log(error)
    })

}

startup()





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