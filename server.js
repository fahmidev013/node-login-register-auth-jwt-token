require('rootpath')();
var express = require('express');
var cors = require('cors');
const bodyParser = require('body-parser');
var expressJwt = require('express-jwt');
var config = require('config.json');
//const mysql = require('mysql');
var app = express();

/* var mysqlConnectionRoot = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "ng_backend"
}); */

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



/* mysqlConnectionRoot.connect(err => {
    if (!err) console.log("DB Connection Succesd");
    else console.log("DB Connect failed" + JSON.stringify(err, undefined, 2));
}); */

app.listen(3000, console.log("Server API Started at port 3000"));

/* // start server
var port = process.env.NODE_ENV === 'production' ? 80 : 4000;
var server = app.listen(port, function () {
    console.log('Server listening on port ' + port);
}); */