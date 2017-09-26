const Mongoose = require('mongoose')

//load database
Mongoose.connect('mongodb://localhost/reaserchProjectSelection/')
var db = Mongoose.connection

db.on('error', console.error.bind(console, 'connection error'))
db.once('open', function () {
    console.log('Connection with database succeeded.')
})

exports.db = db