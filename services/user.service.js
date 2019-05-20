var config = require('config.json');
var _ = require('lodash');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var Q = require('q');
const mysql = require('mysql');


var mysqlConnection = mysql.createConnection({
    host: config.host,
    user: config.user,
    password: config.password,
    database: config.database
});


mysqlConnection.connect(err => {
    if (!err) console.log("DB Connection Succesd");
    else console.log("DB Connect failed" + JSON.stringify(err, undefined, 2));
});


var service = {};

service.authenticate = authenticate;
service.getAll = getAll;
service.getById = getById;
service.create = create;
service.update = update;
service.delete = _delete;

module.exports = service;

function authenticate(username, password) {
    var deferred = Q.defer();

    mysqlConnection.query(
        "SELECT * FROM users WHERE users.username LIKE '%" +
        username +
        "%'",
        (err, user, fields) => {
            if (!err) {

                if (user[0] && bcrypt.compareSync(password, user[0].hash)) {
                    // authentication successful
                    deferred.resolve({
                        _id: user._id,
                        username: user[0].username,
                        firstName: user[0].firstName,
                        lastName: user[0].lastName,
                        token: jwt.sign({
                            sub: user[0]._id
                        }, config.secret)
                    });
                } else {
                    // authentication failed
                    deferred.resolve();
                }

            } else {
                console.log(err);
                deferred.reject(err.name + ': ' + err.message);
            }
        }
    );
    return deferred.promise;
}

function getAll() {
    var deferred = Q.defer();

    mysqlConnection.query("SELECT users._id AS 'id', users.username, users.firstName, users.lastName FROM users",
        (err, users, fields) => {
            if (!err) {
                users = _.map(users, function (user) {
                    return _.omit(user, 'hash');
                });

                deferred.resolve(users);
                //res.send(row);
            } else {
                deferred.reject(err.name + ': ' + err.message);
                console.log(err);
            }
        });
    return deferred.promise;
}

function getById(_id) {
    var deferred = Q.defer();

    mysqlConnection.query(
        "SELECT users._id AS 'id', users.username, users.firstName, users.lastName FROM users WHERE users._id = ?",
        [_id],
        (err, row, fields) => {
            if (!err) {
                row = _.map(row, function (user) {
                    return _.omit(user, 'hash');
                });
                deferred.resolve(row);
                //deferred.resolve(_.omit(row, 'hash'));

            } else {
                deferred.reject(err.name + ': ' + err.message);
                console.log(err);
            }
        }
    );

    return deferred.promise;
}

function create(userParam) {
    var deferred = Q.defer();


    mysqlConnection.query(
        "SELECT users.username FROM users WHERE users.username LIKE '%" +
        userParam.username +
        "%'",
        (err, row, fields) => {
            if (!err) {
                //createUser();
                if (row.length !== 0) {
                    // username already exists
                    deferred.reject('Username "' + userParam.username + '" is already taken');
                } else {
                    //res.send(row);
                    createUser();
                }
            } else {
                console.log(err);
                deferred.reject(err.name + ': ' + err.message);
            }
        }
    );

    function createUser() {
        // set user object to userParam without the cleartext password
        var user = _.omit(userParam, 'password');



        // add hashed password to user object
        user.hash = bcrypt.hashSync(userParam.password, 10);


        mysqlConnection.query(
            "INSERT INTO users SET ?",
            [user],
            (err, row, fields) => {
                if (!err) {
                    deferred.resolve(JSON.stringify(user));
                    console.log("Sukses " + JSON.stringify(user));
                    /* res.send(
                        "Insert Sukses! \n { Request : " + JSON.stringify(req.body) + "\n}"
                    ); */
                } else {
                    deferred.reject(err.name + ': ' + err.message);
                    console.log(err + "  " + JSON.stringify(req.body));
                }


            }
        );


    }

    return deferred.promise;
}

function update(_id, userParam) {
    var deferred = Q.defer();


    mysqlConnection.query(
        "SELECT * FROM users WHERE users._id = ?",
        [_id],
        (err, user, fields) => {
            if (!err) {


                if (user.username !== userParam.username) {

                    mysqlConnection.query(
                        "SELECT users.username FROM users WHERE users.username LIKE '%" +
                        userParam.username +
                        "%'",
                        (err, user, fields) => {

                            if (err) {
                                console.log(err);
                                deferred.reject(err.name + ': ' + err.message);
                            } else {

                                if (user) {
                                    // username already exists
                                    deferred.reject('Username "' + req.body.username + '" is already taken')
                                } else {
                                    updateUser();
                                }
                            }


                        }
                    );


                } else {
                    updateUser();
                }



                //res.send(row);
            } else {
                deferred.reject(err.name + ': ' + err.message);
            }
        }
    );


    mysqlConnection.query(
        "UPDATE users SET ? WHERE users._id = ?",
        [emp, req.params.id],
        (err, user, fields) => {
            if (!err) {

                if (user.username !== userParam.username) {
                    // username has changed so check if the new username is already taken
                    db.users.findOne({
                            username: userParam.username
                        },
                        function (err, user) {
                            if (err) deferred.reject(err.name + ': ' + err.message);

                            if (user) {
                                // username already exists
                                deferred.reject('Username "' + req.body.username + '" is already taken')
                            } else {
                                // res.send(
                                //     "UPDATE Sukses! \n { Request : " + JSON.stringify(req.body) + "\n}"
                                // );
                                updateUser();
                            }
                        });
                } else {
                    updateUser();
                }


            } else {
                console.log(err + "  " + JSON.stringify(req.body));
                deferred.reject(err.name + ': ' + err.message);
            }
        }
    );

    function updateUser() {
        // fields to update
        var set = {
            firstName: userParam.firstName,
            lastName: userParam.lastName,
            username: userParam.username,
        };

        // update password if it was entered
        if (userParam.password) {
            set.hash = bcrypt.hashSync(userParam.password, 10);
        }

        db.users.update({
                _id: mongo.helper.toObjectID(_id)
            }, {
                $set: set
            },
            function (err, doc) {
                if (err) deferred.reject(err.name + ': ' + err.message);

                deferred.resolve();
            });
    }

    return deferred.promise;
}

function _delete(_id) {
    var deferred = Q.defer();


    mysqlConnection.query(
        "DELETE FROM users WHERE _id = ?",
        [_id],
        (err, row, fields) => {
            if (!err) {
                deferred.resolve();
            } else {
                deferred.reject(err.name + ': ' + err.message);
                console.log(err + JSON.stringify(req.params.id));
            }
        }
    );


    return deferred.promise;
}