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

function getUser(){
    return getCookie("username")
}

function setUser(username){
    setCookie("username", username)
}