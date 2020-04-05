const { Item } = require("../schemas");
const readline = require("readline");

const rl = readline.createInterface(process.stdin, process.stdout);

const mongoose = require("mongoose");
const dbpath = process.env.DB_PATH || "mongodb://localhost:27017/test";
mongoose.connect(dbpath);

let name;
let price;
let img;
let description;

function getName() {
    rl.question("Enter a name  ", answer => {
        name = answer;
        getPrice();
    });
}

function getPrice() {
    rl.question("Enter a Price  ", answer => {
        price = parseInt(answer);
        getImg();
    });
}

function getImg() {
    rl.question("Enter Image URL  ", answer => {
        img = answer;
        getDesc();
    });
}

function getDesc() {
    rl.question("Enter a Description  ", answer => {
        description = answer;
        rl.close();
        finish();
    });
}

function finish() {
    new Item({ name: name, image: img, price: price, description: description }).save().then(res => {
        console.log("saved");
        mongoose.disconnect();
    });
}

getName();
