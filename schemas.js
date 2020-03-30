const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    user: {
        type: String,
        unique: true,
        minLength: 1
    },
    password: String,
    games: {
        type: [String],
        default:[]
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    money: {
        type: Number,
        default: 500
    },
    itemsOwned: {
        type: [mongoose.Types.ObjectId],
        default: []
    }, // list of itemNames
    itemSelected: {
        type: mongoose.Types.ObjectId,
        default: null
    }// single itemName
});

userSchema.pre('save', function(next) {
    const user = this;
    if (user.isModified('password')) {
        console.log(user.password);
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(user.password, salt, (err, hash) => {
                user.password = hash;
                next();
            })
        })
    } else {
        next();
    }
});
userSchema.statics.authenticate = function(name, password) {
    const User = this;
    return User.findOne({ user: name }).then((user) => {
        if (!user) {
            return Promise.reject();
        }
        return new Promise((resolve, reject) => {
            bcrypt.compare(password, user.password, (err, result) => {
                if (result) {
                    resolve(user);
                } else {
                    reject();
                }
            });
        });
    });
};


const User = mongoose.model('User', userSchema);

const itemSchema = new Schema({
    name: String,
    description: String,
    image: String,
    price: Number
});

const Item = mongoose.model('Item', itemSchema);

const roomSchema = mongoose.Schema({
    users: [mongoose.Types.ObjectId],
    isPlaying: {
        type: Boolean,
        default: false
    }
});

const Room = mongoose.model('Room', roomSchema);

module.exports = {
    User: User,
    Item: Item,
    Room: Room
};

