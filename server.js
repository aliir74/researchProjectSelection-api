'use strict';

const Hapi = require('hapi')
const XLSX = require('xlsx')
const fs = require('fs')
const db = require('./database').db
const routes = require('./routes')
const Basic = require('hapi-auth-basic')
const User = require('./models/User')
const Grade = require('./models/Grade')


var buf = fs.readFileSync('admin.txt').toString().split('\n')
var admin = new User({username: buf[0], password: buf[1], name: 'Admin'})
admin.save()

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
                var res = {
                    username: request.auth.credentials.username,
                    grade: request.auth.credentials.grade,
                    name: request.auth.credentials.name
                }
                reply(res)
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
                    return
                }
                reply(grades[0].projects)
            })

        }
    })

    server.route({
        method: 'POST',
        path: '/projects/{number}',
        config: {
            auth: 'simple',
            handler: function (request, reply) {
                if(request.auth.credentials.username !== 'admin') {
                    reply('You are not admin!')
                    return
                }
                var grade = new Grade({grade: request.params.number, projects: []})
                grade.save(function (err) {
                    if (err) {
                        reply(err)
                        return
                    }
                    reply('ok')
                })
            }
        }
    })

    //create user route
    server.route({
        method: 'POST',
        path: '/addusers',
        config: {
            payload: {
                output: 'stream',
                parse: true,
                allow: 'multipart/form-data'
            },
            handler: function (request, reply) {
                var data = request.payload;
                if (data.file.hapi) {
                    var name = data.file.hapi.filename;
                    var path = __dirname + "/uploads/" + name;
                    var file = fs.createWriteStream(path);

                    file.on('error', function (err) {
                        console.error(err)
                    });

                    data.file.pipe(file);

                    data.file.on('end', function (err) {

                        var buf = fs.readFileSync(path)
                        var wb = XLSX.read(buf, {type:'buffer'})
                        var sheet_name_list = wb.SheetNames;
                        removeUsers()
                        for (var i = 0; i < sheet_name_list.length; i++) {
                            var xlData = XLSX.utils.sheet_to_json(wb.Sheets[sheet_name_list[i]])
                            addUsersToDB(xlData, parseInt(sheet_name_list[i]) )
                        }
                        var ret = {
                            filename: data.file.hapi.filename,
                            headers: data.file.hapi.headers,
                        }
                        reply(JSON.stringify(ret));
                    })
                } else {
                    reply({ filename: 'no file' })
                }

            }
        }
    })

    server.route({
        method: 'POST',
        path: '/addprojects/{grade}',
        config: {
            payload: {
                output: 'stream',
                parse: true,
                allow: 'multipart/form-data'
            },
            handler: function (request, reply) {
                var data = request.payload;
                if (data.file.hapi) {
                    var name = data.file.hapi.filename;
                    var path = __dirname + "/uploads/" + name;
                    var file = fs.createWriteStream(path);

                    file.on('error', function (err) {
                        console.error(err)
                    });

                    data.file.pipe(file);

                    data.file.on('end', function (err) {
                        var ret = {
                            filename: data.file.hapi.filename,
                            headers: data.file.hapi.headers
                        }
                        console.log(path)
                        fs.readFile(path, 'utf8', function (err, data) {
                            addProjects(data.split('\n'), request.params.grade)
                            reply(JSON.stringify(ret));
                        })
                    })
                } else {
                    reply({ filename: 'no file' })
                }
            }
        }
    })



    server.start( (err) => {
        if (err) {
            throw err
        }
        console.log(`Server running at: ${server.info.uri}`)
    })
})


function addUsersToDB(data, grade) {
    console.log(grade)
    console.log(data.length)
    for (var i = 0; i < data.length; i++) {
        var obj = {
            username: data[i].mellicode,
            name: data[i].name,
            password: data[i].mellicode,
            grade: grade,
            projects: []
        }
        var newUser = new User(obj)
        newUser.save(function (err) {
            if (err) {
                console.log(err)
                return
            }
        })
    }
}

function addProjects(data, grade) {
    Grade.update({grade: grade}, {projects: data}, function (err, doc) {
        if (err) {
            console.error(err)
            return
        }
        console.log('ok')
    })
}

function removeUsers() {
    User.remove({username: {$ne: 'admin'}}, function (err, removed) {
        if (err) {
            console.log(err)
            return
        }
    })
}


