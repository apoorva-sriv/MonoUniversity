async function getUserDetails() {
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
            document.querySelector("#pfp img").src = json.image;
            document.querySelector("#profile-image").src = json.image;
            document.querySelector("#gamesWon").innerText = json.wins;
            // document.querySelector("#rank").innerText = 1;
            document.querySelector("#shopMoney").innerText = json.money;
            window.boughtTokenIds = json.itemsOwned;
            window.currentTokenPath = getCurrentItemPath(json.itemSelected);
            window.isAdmin = json.isAdmin;
            // Admin---needed to be put here because it didn't work down for some reason!
            if (window.isAdmin) {
                const ul = document.querySelector(".fa-ul");
                ul.appendChild(document.createElement("br"));
                const li = document.createElement("li");
                li.innerHTML =
                    '<span class="fa-li"><i class="fas fa-user-shield" aria-hidden="true"></i></span><strong>Admin</strong>';
                li.style.color = "red";
                ul.appendChild(li);
            }
            window.userNameFromDB = json.user;
            document.querySelector("#username").innerText = window.userNameFromDB;
        })
        .catch(error => {
            console.error(error);
        });
}

async function getBoughtItemPaths() {
    for (let counter = 0; counter < window.boughtTokenIds.length; counter++) {
        let tokenId = window.boughtTokenIds[counter];
        let url = "/api/item/" + tokenId;
        await fetch(url)
            .then(res => {
                if (res.status === 200) {
                    return res.json();
                } else {
                    alert("Could not get item");
                }
            })
            .then(itemJson => {
                window.availableTokenPaths.push(itemJson.image);
                window.tokenPathsToObjects[itemJson.image] = itemJson._id;
            })
            .catch(error => {
                console.error(error);
            });
    }
}

function getCurrentItemPath(currentItem) {
    if (!currentItem) {
        return "./img/pieces/default.png";
    }
    let url = "/api/shop/" + currentItem;
    return fetch(url)
        .then(res => {
            if (res.status === 200) {
                return res.json();
            } else {
                alert("Could not get item");
            }
        })
        .then(itemJson => {
            window.currentTokenPath = itemJson.image;
        })
        .catch(error => {
            console.error(error);
        });
}

function saveUserInfo() {
    const url = "/api/user/";

    let data = {
        username: window.userNameFromDB,
        money: document.querySelector("#shopMoney").innerText,
        wins: document.querySelector("#gamesWon").innerText,
        points: 0,
        itemSelected: window.tokenPathsToObjects["./img" + window.currentTokenPath.split("/img")[1]],
        image: document.querySelector("#profile-image").src,
    };

    const request = new Request(url, {
        method: "PATCH",
        body: JSON.stringify(data),
        headers: {
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json",
        },
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

async function displayTokens() {
    // Token selector
    const tokens = document.querySelector("#tokens");

    for (let counter = 0; counter < window.availableTokenPaths.length; counter++) {
        tokenPath = window.availableTokenPaths[counter];
        const li = document.createElement("li"); // Note: "const" instead of "let" is valid inside for loops since the variable goes out of scope and is redeclared after each iteration (https://stackoverflow.com/a/50808013/4179032)!
        const img = document.createElement("img");
        img.style.cursor = "pointer";
        img.class = "tooltip";
        img.src = tokenPath;
        img.addEventListener("click", async function clickImage(e) {
            // Remove the borders from the other tokens.
            document.querySelectorAll("#tokens img").forEach(elem => {
                elem.style.border = "0";
            });
            // Add border to current token.
            e.target.style.border = "2px solid rgb(3, 96, 156)";
            window.currentTokenPath = img.src;
            await saveUserInfo();
        });
        if (tokenPath === window.currentTokenPath) {
            img.style.border = "2px solid rgb(3, 96, 156)";
        }
        li.appendChild(img);
        tokens.appendChild(li);
    }
}

function validFileType(file) {
    // Taken from https://developer.mozilla.org/en-US/docs/Web/Media/Formats/Image_types
    const fileTypes = [
        "image/apng",
        "image/bmp",
        "image/gif",
        "image/jpeg",
        "image/pjpeg",
        "image/png",
        "image/svg+xml",
        "image/tiff",
        "image/webp",
        "image/x-icon",
    ];

    return fileTypes.includes(file.type);
}

function setProfilePic() {
    const preview = document.querySelector("#inline-container");

    const url = "/signature";
    fetch(url)
        .then(res => {
            if (res.status === 200) {
                return res;
            } else {
                alert("Could not get signature");
            }
        })
        .then(res => res.json())
        .then(json => {
            const myWidget = cloudinary.createUploadWidget(
                {
                    cloudName: json.cloud_name,
                    multiple: false,
                    publicId: window.userNameFromDB,
                    uploadPreset: "ml_default",
                    uploadSignature: json.shastr,
                    uploadSignatureTimestamp: Number(json.time),
                    apiKey: json.api_key,
                },
                (error, result) => {
                    if (!error && result && result.event === "success") {
                        document.querySelector("#pfp img").src = result.info.secure_url;
                        document.querySelector("#profile-image").src = result.info.secure_url;
                        saveUserInfo();
                    }
                }
            );
            preview.addEventListener(
                "click",
                function openWidget() {
                    myWidget.open();
                },
                false
            );
        })
        .catch(error => {
            console.error(error);
        });
}

/*
async function setUsername() {
    // Edit username
    const userName = document.querySelector("#username");
    userName.addEventListener("input", function editUsername() {
        if (!userName.textContent) {
            userName.textContent = window.userNameFromDB;
        }
    });
}
*/

async function main() {
    window.tokenPathsToObjects = { "./img/pieces/default.png": null };
    window.availableTokenPaths = ["./img/pieces/default.png"]; // ultimately, available tokens = default + bought tokens
    await getUserDetails();
    setProfilePic();
    // await setUsername();
    await getBoughtItemPaths();
    await displayTokens();
}

main();
