function getCookie(key){
    var name = key + "="
    var nameLst = document.cookie.split(";")

    for (let i=0; i<nameLst.length; i++){
        let curr = nameLst[i]

        while (curr.charAt(0) ==' '){
            curr = curr.substring(1, curr.length)
        }

        if (curr.indexOf(name) == 0){
            return curr.substring(name.length, curr.length)
        }
    }
    return null
}

function setCookie(key, value){
    document.cookie = key + "=" + value
}

function getUserId(){
    return getCookie("id")
}

function setUser (username){
    const url = "/api/id/" + username
    const request = new Request (url, {
        method: 'get',
    });

    fetch(request).then( (res) => {
        return res.json()
    }).then( (json)=>{
        setCookie("id", json._id)
    })
}

function getUserObj (id) {
    
    // incomplete function
    // take id (mongodb id) and return the mongodb object

    const url = "/api/user/" + id

    return fetch(url)
}

// Audio
const audio = document.querySelector('#audio');
const audioIcon = document.querySelector("#audioIcon");
if (audioIcon) {
    audioIcon.addEventListener('click', function toggleAudio() {
        if (audio.paused || audio.muted)   // audio.paused for the first time the page is loaded (in Chrome at least, where autoplay is disabled)
        {
            audioIcon.src = "/img/audioIcon.png";
            audio.play();
            audio.muted = false;
        } else {
            audioIcon.src = "/img/audioIconMuted.png";
            audio.muted = true;
        }
    });
}

// Profile navigation
document.querySelector("#rightbar").addEventListener("click", function goToProfile() {
   window.location = "./profile.html";
});