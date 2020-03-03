const shop = document.getElementById('shop')

function clearItems(){
    shop.innerHTML = "";
}

function addItem(item){
    const div = document.createElement('div');
    div.className = 'item';

    const icon = document.createElement('div');
    icon.className = 'icon';
    const img = document.createElement('img');
    img.setAttribute('src', item.image);
    icon.appendChild(img);
    div.appendChild(icon);

    const description = document.createElement('div');
    description.className = 'description';
    description.innerHTML = '<span class="item-name">'+ item.name + '</span><br />' +
                item.description;
    div.appendChild(description);
    div.appendChild(document.createElement('br'));

    const buy = document.createElement('button');
    buy.className = 'buy';
    buy.innerHTML = 'Buy<br />∰' + item.price;

    div.appendChild(buy);
    shop.appendChild(div);

    buy.addEventListener('click', (e) => buyItem(e, div, item));
}

function item (){

}

function fetchItems(){
    //TODO fetch items from server

    return Array(6).fill({
        image: 'img/tenkai.png',
        name: 'Tenkai',
        description: 'Lorem ipsum, dolor sit amet. Consectetur adipiscing elit.',
        price: 301,
        bought: false
    });
}

function addItems(items){
    items.forEach(addItem);
}

function buyItem(e, div, item){
    //TODO make server request
    e.preventDefault();
    if(item.bought) return;
    e.target.innerHTML = 'Bought';
    item.bought = true;
}

const leaveBtn = document.querySelector("#leave-btn")
leaveBtn.addEventListener("click", (e)=>{
    window.location.replace('./newgame.html');
})

clearItems();
addItems(fetchItems());
