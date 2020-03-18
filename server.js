'use strict';

const log = console.log;
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const { userSchema } = require('./schemas.js');

const saltRounds = 10;

const dbpath = process.env.DB_PATH || 'mongodb://localhost:27017/test';
mongoose.connect(dbpath);

const app = express();

const User = mongoose.model('User', userSchema);

app.use(express.static(__dirname + '/pub'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.get('/api/', (req, res) => {
    res.send('Test')
});

app.post('/api/signup', async (req, res) => {
    const body = req.body;
    if(typeof body.password === "undefined" || typeof body.user === "undefined"){
        res.status(400).send("Username and password cannot be empty");
        return;
    }
    if(body.password.length === 0 || body.user.length === 0){
        res.status(400).send("Username and password cannot be empty");
        return;
    }

    const docs = await User.find({user : body.user}).exec();
    if(docs.length > 0){
        res.status(400).send("Username is already taken.");
        return;
    }
    const hashed = await bcrypt.hash(body.password, saltRounds);
    const user = new User({ user: body.user, password: hashed, games: []});
    await user.save();
    res.sendStatus(200);
});

app.post('/api/login', async (req, res) => {
    const body = req.body;
    if(typeof body.password === "undefined" || typeof body.user === "undefined"){
        res.status(400).send("Username and password cannot be empty");
        return;
    }
    if(body.password.length === 0 || body.user.length === 0){
        res.status(400).send("Username and password cannot be empty");
        return;
    }

    const docs = await User.find({user : body.user}).exec();
    if(docs.length === 0){
        res.status(400).send("Invalid username or password");
        return;
    }
    const matches = await bcrypt.compare(body.password, docs[0].password);
    if(!matches){
        res.status(400).send("Invalid username or password");
    }else{
        res.status(200).json(docs[0]);
    }
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
    log(`Server started on port ${port}...`);
});

