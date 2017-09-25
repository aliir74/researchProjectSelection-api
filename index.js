'use strict';

const Hapi = require('hapi')
const db = require('./database').db
const routes = require('./routes')
const Basic = require('hapi-auth-basic')
const Bcrypt = require('bcrypt')
const User = require('./models/User')
const Wolf = require('./models/Wolf')

const server = new Hapi.Server()

server.connection({port: 8000, routes: {cors: true}})

const validate = function (req, username, password, callback) {
    Wolf.find({name: username}, function (err, user) {
        if (user.length === 0) {
            return callback(null, false)
        }
        console.log(user)
        callback(err, true, {id: user[0]._id, username: user[0].name})
        /*
        Bcrypt.compare(password, password, (err, isValid) => {
            console.log(isValid)
            callback(err, isValid, {id: user._id, username: user.name})
        })
        */
    })

}

server.register(Basic, (err) => {
    if (err) {
        throw err
    }

    server.auth.strategy('simple', 'basic', {validateFunc: validate})

    //server.route(routes)
    server.route({
        method: 'GET',
        path: '/',
        config: {
            auth: 'simple',
            handler: function (request, reply) {
                reply('hello')
                //reply('hello, ' + request.auth.credentials.username);
                //reply({request.auth.credentials.username})
            }
        }
    });


    server.start( (err) => {
        if (err) {
            throw err
        }
        console.log(`Server running at: ${server.info.uri}`)
    })
})



