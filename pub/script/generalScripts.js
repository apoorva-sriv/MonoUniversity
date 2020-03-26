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