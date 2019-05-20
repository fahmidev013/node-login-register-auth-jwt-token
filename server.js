require('rootpath')();
var express = require('express');
var cors = require('cors');
const bodyParser = require('body-parser');
var expressJwt = require('express-jwt');
var config = require('config.json');

var app = express();

app.use(cors());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());


// use JWT auth to secure the api, the token can be passed in the authorization header or querystring
app.use(expressJwt({
    secret: config.secret,
    getToken: function (req) {
        if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
            return req.headers.authorization.split(' ')[1];
        } else if (req.query && req.query.token) {
            return req.query.token;
        }
        return null;
    }
}).unless({
    path: ['/users/authenticate', '/users/register']
}));

// routes
app.use('/users', require('./controllers/users.controller'));

// error handler
app.use(function (err, req, res, next) {
    if (err.name === 'UnauthorizedError') {
        res.status(401).send('Invalid Token');
    } else {
        throw err;
    }
});


app.listen(4000, console.log("Server API Started at port 4000"));