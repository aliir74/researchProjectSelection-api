var routes = [
{
    method: 'GET',
    path: '/',
    handler: function (req, res) {
        res('hello world!')
    }
},
{
    method: 'GET',
    path: '/{name}',
    handler: function (req, res) {
        res('hello ' + encodeURIComponent(req.params.name))
    }
}, {
        method: 'GET',
        path: '/wolves',
        handler: function (req, res) {
            Wolf.find(function (err, wolves) {
                if (err) {
                    console.error(err)
                }
                
                res(wolves)
            })
        }
    },
    {
        method: 'POST',
        path: '/wolves/{name}',
        handler: function (req, res) {
            const wolf = new Wolf({
                name: encodeURIComponent(req.params.name)
            })
            wolf.save(function (err, wolf) {
                if (err) {
                    console.error(err)
                }
                res(wolf._id)
                
            })
        }
    }
]

module.exports = routes