const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    user: String,
    password: String,
    games: [String]
});

module.exports = {
    userSchema: userSchema
}