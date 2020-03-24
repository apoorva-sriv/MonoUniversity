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
    games: [String],
    isAdmin: Boolean,
    money: Number,
    itemsOwned: [String], // list of itemNames
    itemSelected: String // single itemName
});

userSchema.pre('save', function(next) {
    const user = this;
    if (user.isModified('password')) {
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

module.exports = {
    User: User
};

