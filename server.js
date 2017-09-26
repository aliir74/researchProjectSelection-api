'use strict';

const Hapi = require('hapi')
const db = require('./database').db
const routes = require('./routes')
const Basic = require('hapi-auth-basic')
const User = require('./models/User')
const Grade = require('./models/Grade')

const server = new Hapi.Server()

server.connection({port: 8000, routes: {cors: true}})

const validate = function (req, username, password, callback) {
    User.find({username: username}, function (err, user) {
        if (user.length === 0 || (user[0].password !== password)) {
            return callback(null, false)
        }
        callback(err, true, {id: user[0]._id, username: user[0].username, name: user[0].name, grade: user[0].grade})
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

    server.route({
        method: 'GET',
        path: '/projects/{grade}',
        handler: function (request, reply) {
            Grade.find({grade: request.params.grade}, function (err, grades) {
                if (err || grades.length === 0) {
                    reply('error on getting projects')
                }
                reply(grades[0].projects)
            })

        }
    })

    server.route({
        method: 'POST',
        path: '/projects/{number}',
        handler: function (request, reply) {
            var grade = new Grade({grade: request.params.number, projects: []})
            grade.save(function (err) {
                if (err) {
                    reply(err.message)
                    return
                }
                reply('ok')
            })
        }
    })


    server.start( (err) => {
        if (err) {
            throw err
        }
        console.log(`Server running at: ${server.info.uri}`)
    })
})



