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
    secret: crypto.randomBytes(16).toString(),
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
function authenticate(req, res, next){
    if (!req.session.username) res.sendStatus(401);
    else next();
}
app.post('/api/signup', existsUserPass, async (req, res) => {
    const body = req.body;
    const docs = await User.find({user : body.user}).exec();
    if(docs.length > 0){
        res.status(400).send("Username is already taken.");
        return;
    }
    const user = new User({ user: body.user, password: body.password, money: 500, itemsOwned :["default"], itemSelected: "default" });
    await user.save();
    res.sendStatus(200);
});

app.post('/api/login', existsUserPass, async (req, res) => {
    try {
        const user = await User.authenticate(req.body.user, req.body.password);
        req.session.username = user.user;
        res.sendStatus(200);
    } catch(e) {
        res.status(400).send("Invalid username or password");
    }
});

app.get('/api/logout', async (req, res) => {
   req.session.destroy((error) => {
      if(error){
          res.sendStatus(500);
      } else {
          res.redirect('/');
      }
   });
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
    log(`Server started on port ${port}...`);
});

