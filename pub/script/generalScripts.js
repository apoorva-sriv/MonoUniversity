function getCookie(key) {
    var name = key + "=";
    var nameLst = document.cookie.split(";");

    for (let i = 0; i < nameLst.length; i++) {
        let curr = nameLst[i];

        while (curr.charAt(0) == " ") {
            curr = curr.substring(1, curr.length);
        }

        if (curr.indexOf(name) == 0) {
            return curr.substring(name.length, curr.length);
        }
    }
    return null;
}

function setCookie(key, value) {
    document.cookie = key + "=" + value;
}

function getUserId() {
    return getCookie("id");
}

function setUser(username) {
    const url = "/api/id/" + username;
    const request = new Request(url, {
        method: "get",
    });

    fetch(request)
        .then(res => {
            return res.json();
        })
        .then(json => {
            setCookie("id", json._id);
        });
}

function getUserObj(id) {
    // incomplete function
    // take id (mongodb id) and return the mongodb object

    const url = "/api/user/" + id;

    return fetch(url);
}

// Audio
const audio = document.querySelector("#audio");
const audioIcon = document.querySelector("#audioIcon");
if (audioIcon) {
    // while loading page, before any clicks
    if (audio.paused || audio.muted) {
        // audio.paused for the first time the page is loaded (in Chrome at least, where autoplay is disabled)
        audioIcon.src = "/img/audioIcon.png";
        audio.play();
        audio.muted = false;
    } else {
        audioIcon.src = "/img/audioIconMuted.png";
        audio.muted = true;
    }
    audioIcon.addEventListener("click", function toggleAudio() {
        if (audio.paused || audio.muted) {
            // audio.paused for the first time the page is loaded (in Chrome at least, where autoplay is disabled)
            audioIcon.src = "/img/audioIcon.png";
            audio.play();
            audio.muted = false;
        } else {
            audioIcon.src = "/img/audioIconMuted.png";
            audio.muted = true;
        }
    });
}

async function displayUserInfo() {
    const profile = document.querySelector("#profile");
    const pfpimg = document.querySelector("#pfp img");
    if (!document.querySelector("#leave-btn") && profile) {
        // This function doesn't work in shop.html for some reason, so this check
        // is ensuring the current page is NOT shop.html (does NOT contain the "Leave Shop" button). Profile check for NOT index.html

        const url = "/api/user";
        await fetch(url)
            .then(res => {
                if (res.status === 200) {
                    return res.json();
                } else {
                    alert("Could not get username");
                }
            })
            .then(json => {
                profile.innerText = json.user;
                pfpimg.src = json.image;
            })
            .catch(error => {
                console.error(error);
            });
    }
}

displayUserInfo();

// Profile navigation
const rightbar = document.querySelector("#rightbar");
if (rightbar) {
    rightbar.addEventListener("click", function goToProfile() {
        window.location = "./profile.html";
    });
}
