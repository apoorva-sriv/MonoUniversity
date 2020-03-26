'use strict';

const log = console.log;
const express = require('express');
const session = require('express-session');
const crypto = require('crypto');

const { User, Item } = require('./schemas.js');

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
        expires: 60000*1000,
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
    const user = new User({ user: body.user, password: body.password});
    await user.save();
    res.sendStatus(200);
});

app.post('/api/login', existsUserPass, async (req, res) => {
    try {
        const user = await User.authenticate(req.body.user, req.body.password);
        req.session.username = user.user;
        await res.sendStatus(200);
    } catch(e) {
        console.log(e);
        await res.status(400).send("Invalid username or password");
    }
});

app.get('/api/logout', (req, res) => {
   req.session.destroy((error) => {
      if(error){
          res.sendStatus(500);
      } else {
          res.redirect('/');
      }
   });
});

app.get('/api/id/:username', (req, res) => {
    User.findOne({user: req.params.username}).then((user) => {
        if(user) res.send(user);
        else res.sendStatus(404);
    }, (error) => {
        res.status(500).send(error)
    })
});

app.get('/api/user/:id', (req, res) => {
    const id = req.params.id;

    User.findById(id).then((user) => {
        if (!user){
            res.status(404).send()
        }else{
            res.send(user)
        }
    }).catch ((error) => {
        res.status(500).send()
    })
});

app.get('/api/shop', (req, res) => {
    Item.find({}, (err, items) => {
        res.json(items);
    })
});

app.get('/api/shop/user', authenticate, async (req, res) => {
    const items = await Item.find({});
    const user = await User.findOne({user: req.session.username});
    if(!user){
        res.sendStatus(404);
        return;
    }
    await res.json(items.filter((x) => !user.itemsOwned.includes(x._id)));
});

app.get('/api/shop/:itemid', async (req, res) => {
    let item;
    try {
        item = await Item.findById(req.params.itemid);
    }catch(e){
        res.sendStatus(404); return;
    }
    if(!item){
        res.sendStatus(404);
        return;
    }
    await res.json(item);
});

app.put('/api/shop/:itemid', authenticate, async (req, res) => {
   let user; let item;
   try {
       user = await User.findOne({user: req.session.username});
       item = await Item.findById(req.params.itemid);
   }catch(e){
       res.sendStatus(403);
       return;
   }
   if(!user || !item){
       res.sendStatus(404);
   }else if(user.money < item.price){
       res.status(401).send("Not enough money");
   }else if(user.itemsOwned.includes(item._id)){
       res.status(401).send("Already owned");
   }else {
       user.itemsOwned.push(item._id);
       user.money -= item.price;
       await res.json(user);
       await user.save()
   }
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
    log(`Server started on port ${port}...`);
});

