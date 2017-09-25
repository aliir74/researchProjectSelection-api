const mongoose = require('mongoose')
const Schema = mongoose.Schema

var UserSchema = new Schema({
    username: String,
    password: String,
    grade: Number,
    name: String,
    projects: [{priority: Number, name: String}]
})

module.exports = mongoose.model('User', UserSchema)