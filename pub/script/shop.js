const shop = document.getElementById("shop");

async function updateUserDisplay() {
    const url = "/api/user";

    await fetch(url)
        .then(res => {
            if (res.status === 200) {
                return res.json();
            } else {
                alert("Could not get user");
            }
        })
        .then(json => {
            document.querySelector("#username").innerText = json.user;
            document.querySelector("#userMoney").innerText = "∰" + json.money;
            document.querySelector("#pfp img").src = json.image;
            window.isAdmin = json.isAdmin;
        })
        .catch(error => {
            console.error(error);
        });
}

function clearItems() {
    shop.innerHTML = "";
}

function addItem(item) {
    const div = document.createElement("div");
    div.className = "item";

    const icon = document.createElement("div");
    icon.className = "icon";
    const img = document.createElement("img");
    img.setAttribute("src", item.image);
    icon.appendChild(img);
    div.appendChild(icon);

    const description = document.createElement("div");
    description.className = "description";
    description.innerHTML = '<span class="item-name">' + item.name + "</span><br />" + item.description;
    div.appendChild(description);
    div.appendChild(document.createElement("br"));

    const buy = document.createElement("button");
    buy.className = "buy";
    buy.innerHTML = "Buy<br />∰" + item.price;

    div.appendChild(buy);
    shop.appendChild(div);

    buy.addEventListener("click", e => {
        buyItem(e, div, item);
        // Update user money display (not patched to DB yet--> done later somewhere?!))
        let userMoneyNumber = Number(document.querySelector("#userMoney").innerText.substr(1));
        if (window.isAdmin || userMoneyNumber >= 500) {
            document.querySelector("#userMoney").innerText = `∰${userMoneyNumber - 500}`;
        }
    });
}

function fetchItems(cb) {
    $.get("/api/shop/user").then(dat => {
        cb(dat);
    });
}

function addItems(items) {
    items.forEach(addItem);
}

function buyItem(e, div, item) {
    e.preventDefault();
    $.ajax({
        url: "/api/shop/" + item._id,
        type: "PUT",
        success: () => {
            e.target.innerHTML = "Bought";
            item.bought = true;
        },
        error: err => {
            window.alert(err.responseText);
        }
    });
}

const leaveBtn = document.querySelector("#leave-btn");
leaveBtn.addEventListener("click", e => {
    window.location.replace("./newgame.html");
});

clearItems();
fetchItems(addItems);
updateUserDisplay();

// function populateShop(){
//     const url = "/api/shop/user"

//     fetch(url)
//     .then((res) => {
//         if (res.status === 200) {
//            return res.json()
//        } else {
//             alert('Could not get items for shop')
//        }
//     })
//     .then((json) => {

//         fetchItems()
//     }).catch((error) => {
//         log(error)
//     })

// }
