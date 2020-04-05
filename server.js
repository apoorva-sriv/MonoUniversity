'use strict';

const log = console.log;
const express = require('express');
const session = require('express-session');
const crypto = require('crypto');

const app = express();

const server = require('http').createServer(app);
// const io = require('socket.io')(server);

const sessionMiddleware = session({
    secret: "thisisthesecretpleasedontreadthis",
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 60000*1000,
        httpOnly: true
    }
});
/*
io.use((socket, next) => {
    sessionMiddleware(socket.request, socket.request.res, next);
});
*/
const { User, Item, Room } = require('./schemas.js');
//const socket_setup = require('./socket-setup.js');

const mongoose = require('mongoose');
const dbpath = process.env.DB_PATH || 'mongodb://localhost:27017/test';
mongoose.connect(dbpath);


app.use(express.static(__dirname + '/pub'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(sessionMiddleware);

function existsUserPass(req, res, next){
    const body = req.body;
    if(typeof body.password === "undefined" || typeof body.user === "undefined"){
        res.status(400).send("Username and password cannot be empty");
    }else if(body.password.length === 0 || body.user.length === 0){
        res.status(400).send("Username and password cannot be empty");
    } else {
        next();
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

app.get('/api/room/:id', async (req, res) => {
    const room = await Room.findById(req.params.id);
    for(let i=0; i<room.users.length; i++){
        room.users[i] = await User.findById(room.users[i]);
    }
    res.json(room);
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
    }).catch ((e) => {
        res.status(500).send(e)
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
    }else if(user.money < item.price && !user.isAdmin){
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

// Post item
app.post('/api/shop/item', async (req, res) => {
    const item = new Item({ name: req.body.name, description: req.body.description, image: req.body.image, price: req.body.price});
    await item.save();
    res.sendStatus(200);
});

app.get('/api/item/:id', async (req, res) => {
    const item = await Item.findById(req.params.id);
    await res.json(item);
});

// Get current User
app.get('/api/user', authenticate, async (req, res) => {
    // console.log(req.session.username)
    try {
        const user = await User.findOne({user: req.session.username});
        if(!user){
            return res.sendStatus(404);
        }
        const items = [];
        for(let i=0; i<user.itemsOwned.length; i++){
            items.push(await Item.findById(user.itemsOwned[i]));
        }
        items.push({name: "Default", description: "This is the default item",
            behaviourId: 0, image: "img/default.png"});
        user.itemsOwned = items;
        user.itemSelected = await Item.findById(user.itemSelected);
        await res.json(user);
    }catch(e){
        res.status(500).send(e);
    }
});

// Get list of all existing (non-admin) users
app.get('/api/users', (req, res) => {
    User.find().then((users) => {
        users = users.filter(user => !user.isAdmin);
        res.send(users)
    }, (error) => {
        res.status(500).send(error)
    })
});

// Get list of all existing users (including admin)
app.get('/api/users/all', (req, res) => {
    User.find().then((users) => {
        res.send(users)
    }, (error) => {
        res.status(500).send(error)
    })
});

// update given user's info
app.patch('/api/user', (req, res) => {

    const username = req.body.username;
    const money = req.body.money;
    const wins = req.body.wins;
    const points = req.body.points;

    User.find().then((allUsers) => {
        const targetUser = allUsers.filter((user) => user.user === username);
        targetUser[0].money = money;
        targetUser[0].wins = wins;
        targetUser[0].points = points;

        targetUser[0].save().then((resultUser) =>{
            // do nothing for now
        }, (error) => {
            res.status(400).send(error)
        })
    })
});

app.get('/api/createGame', authenticate, async (req, res) => {
    const user = await User.findOne({user: req.session.username});
    if(!user) return res.sendStatus(404);
    const room = new Room({users: [user._id]});
    await room.save();
    return res.redirect('/room/'+ room._id);
});

app.get('/room/:id', authenticate, async (req, res) => {
    if(await Room.findById(req.params.id))
        res.sendFile('./pub/room.html', {root: __dirname});
    else
        res.sendStatus(404);
});

app.get('/board/:id', authenticate, async (req, res) => {
    if(await Board.findById(req.params.id))
        res.sendFile('./pub/board.html', {root: __dirname});
    else
        res.sendStatus(404);
});
app.put('/api/win', authenticate, async (req, res) => {
    const user = await User.findOne({user: req.session.username});
    user.wins += 1;
    user.points += 0.2
    user.money += 100 + (user.points * 100);
    await user.save();
    res.sendStatus(200);
});
/*
io.on('connection', (socket) => {
    if(!socket.request.session.username){
        return socket.disconnect(true);
    } else {
        socket_setup(socket);
    }
});
*/
const port = process.env.PORT || 5000;
server.listen(port, () => {
    log(`Server started on port ${port}...`);
});