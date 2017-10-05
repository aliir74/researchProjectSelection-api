const mongoose = require('mongoose')
const Schema = mongoose.Schema

var UserSchema = new Schema({
    username: {type: String, unique: true},
    password: String,
    grade: Number,
    name: String,
    enrolled: Boolean,
    projects: [{priority: Number, name: String}]
})

module.exports = mongoose.model('User', UserSchema)