'use strict';

const log = console.log;
const express = require('express');
const session = require('express-session');
const crypto = require('crypto');

const { User } = require('./schemas.js');

const mongoose = require('mongoose');
const dbpath = process.env.DB_PATH || 'mongodb://localhost:27017/test';
mongoose.connect(dbpath);

const app = express();


app.use(express.static(__dirname + '/pub'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(session({
    secret: crypto.randomBytes(16),
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 60000,
        httpOnly: true
    }
}));

function existsUserPass(req, res, next){
    const body = req.body;
    if(typeof body.password === "undefined" || typeof body.user === "undefined"){
        res.status(400).send("Username and password cannot be empty");
    }else if(body.password.length === 0 || body.user.length === 0){
        res.status(400).send("Username and password cannot be empty");
    } else {
        next()
    }
}

app.post('/api/signup', existsUserPass, async (req, res) => {
    const body = req.body;
    const docs = await User.find({user : body.user}).exec();
    if(docs.length > 0){
        res.status(400).send("Username is already taken.");
        return;
    }
    const user = new User({ user: body.user, password: body.password});
    await user.save();
    res.sendStatus(200);
});

app.post('/api/login', existsUserPass, async (req, res) => {
    try {
        res.status(200).json(await User.authenticate(req.body.user, req.body.password));
    } catch(e) {
        res.status(400).send("Invalid username or password");
    }
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
    log(`Server started on port ${port}...`);
});

