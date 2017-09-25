const mongoose = require('mongoose')
const Schema = mongoose.Schema

var GradeSchema = new Schema({
    projects: [String],
    grade: Number
})

module.exports = mongoose.model('Grade', GradeSchema)