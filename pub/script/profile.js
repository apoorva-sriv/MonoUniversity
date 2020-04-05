window.availableTokens = ["./img/pieces/default.png"];

function getUserDetails() {
    const url = "/api/user";

    fetch(url)
        .then((res) => {
            if (res.status === 200) {
                return res.json();
            } else {
                alert('Could not get user');
            }
        })
        .then((json) => {
            window.currentToken = json.itemSelected;
            document.querySelector("#gamesWon").innerText = json.wins;
            // document.querySelector("#rank").innerText = 1;
            document.querySelector("#shopMoney").innerText = json.money;
            window.availableTokens = window.availableTokens.concat(json.itemsOwned);
            window.isAdmin = json.isAdmin;
            // Admin---needed to be put here because it didn't work down for some reason!
            if (window.isAdmin) {
                const ul = document.querySelector(".fa-ul");
                ul.appendChild(document.createElement("br"));
                const li = document.createElement("li");
                li.innerHTML = '<span class="fa-li"><i class="fas fa-user-shield" aria-hidden="true"></i></span><strong>Admin</strong>';
                li.style.color = "red";
                ul.appendChild(li);
            }
            document.querySelector("#username").innerText = json.user;
        }).catch((error) => {
        console.log(error);
    });
}

function getItemPaths() {
    for (const token of window.availableTokens) {
        let url = "/api/shop/" + token;
        fetch(url)
            .then((res) => {
                if (res.status === 200) {
                    return res.json();
                } else {
                    alert('Could not get item');
                }
            })
            .then((json) => {
                window.availableTokens.push(json.image);
            }).catch((error) => {
            console.log(error);
        });
    }

}

getUserDetails();
getItemNames();

/*
// Upload profile picture
// See https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#Examples
const input = document.querySelector("input");
const preview = document.querySelector("#inline-container");

// This will be called when the user has chosen a file, NOT when input is 'click'ed (otherwise
// input.files will be empty when run immediately after just clicking and before the user has chosen anything)!
input.addEventListener("input", function changeInput() {
    const curFiles = input.files;
    if (curFiles.length === 1) {
        const file = curFiles[0];

        if (validFileType(file)) {
            const imgURL = URL.createObjectURL(file);
            document.querySelector("#profile-image").src = imgURL;
            document.querySelector("#pfp img").src = imgURL;
        }
    }
});

preview.addEventListener("click", function clickPreview() {
    input.click();   // Send click event to input button, which has the event listener added above.
});
*/

// Taken from https://developer.mozilla.org/en-US/docs/Web/Media/Formats/Image_types
const fileTypes = [
    'image/apng',
    'image/bmp',
    'image/gif',
    'image/jpeg',
    'image/pjpeg',
    'image/png',
    'image/svg+xml',
    'image/tiff',
    'image/webp',
    `image/x-icon`
];

function validFileType(file) {
    return fileTypes.includes(file.type);
}

const tokens = document.querySelector("#tokens");

let counter = 0;
for (const availableToken of window.availableTokens) {
    const li = document.createElement("li");   // Note: "const" instead of "let" is valid inside for loops since the variable goes out of scope and is redeclared after each iteration (https://stackoverflow.com/a/50808013/4179032)!
    const img = document.createElement("img");
    img.style.cursor = "pointer";
    img.src = availableToken;
    img.addEventListener("click", function clickImage(e) {
        // Remove the borders from the other tokens.
        document.querySelectorAll("#tokens img").forEach(elem => {
            elem.style.border = "0";
        });
        // Add border to current token.
        e.target.style.border = "2px solid rgb(3, 96, 156)";
        const splitArray = e.target.src.split("/");
        currentTokenName = splitArray[splitArray.length - 1].split("-black.png")[0];
    });
    if (availableToken === currentTokenName) {
        img.style.border = "2px solid rgb(3, 96, 156)";
    }
    li.appendChild(img);
    tokens.appendChild(li);
}

