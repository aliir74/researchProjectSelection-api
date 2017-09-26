const mongoose = require('mongoose')
const Schema = mongoose.Schema

var GradeSchema = new Schema({
    projects: [String],
    grade: {type: Number, unique: true}
})

module.exports = mongoose.model('Grade', GradeSchema)