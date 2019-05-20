var config = require('config.json');
var _ = require('lodash');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var Q = require('q');
var mongo = require('mongoskin');
const mysql = require('mysql');
var db = mongo.db(config.connectionString, {
    native_parser: true
});


var mysqlConnection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "ng_backend"
});


mysqlConnection.connect(err => {
    if (!err) console.log("DB Connection Succesd");
    else console.log("DB Connect failed" + JSON.stringify(err, undefined, 2));
});


//db.bind('users');

var service = {};

service.authenticate = authenticate;
service.getAll = getAll;
service.getById = getById;
service.create = create;
service.update = update;
service.delete = _delete;

module.exports = service;

/* 
app.get("/employee", (req, res) => {
    mysqlConnection.query("SELECT * FROM employee", (err, row, fields) => {
        if (!err) res.send(row);
        else console.log(err);
    });
});

app.get("/employee/:id", (req, res) => {
    mysqlConnection.query(
        "SELECT * FROM employee WHERE employee.EmpID = ?",
        [req.params.id],
        (err, row, fields) => {
            if (!err) res.send(row);
            else console.log(err);
        }
    );
});

app.get("/employee/salary/:nama", (req, res) => {
    mysqlConnection.query(
        "SELECT employee.Name AS 'Nama Karyawan', employee.EmpCode AS 'Jabatan', employee.Salary AS 'GAJI' FROM employee WHERE employee.Name LIKE '%" +
        req.params.nama +
        "%'",
        (err, row, fields) => {
            if (!err) res.send(row);
            else console.log(err);
        }
    );
});

app.delete("/employee/:id", (req, res) => {
    mysqlConnection.query(
        "DELETE FROM employee WHERE EmpID = ?",
        [req.params.id],
        (err, row, fields) => {
            if (!err) res.send("Delete Sukses!");
            else console.log(err + JSON.stringify(req.params.id));
        }
    );
});

app.post("/employee", (req, res) => {
    var emp = req.body;
    mysqlConnection.query(
        "INSERT INTO employee SET ?",
        [emp],
        (err, row, fields) => {
            if (!err)
                res.send(
                    "Insert Sukses! \n { Request : " + JSON.stringify(req.body) + "\n}"
                );
            else console.log(err + "  " + JSON.stringify(req.body));
        }
    );
});

app.put("/employee/:id", (req, res) => {
    var emp = req.body;
    mysqlConnection.query(
        "UPDATE employee SET ? WHERE employee.EmpID = ?",
        [emp, req.params.id],
        (err, row, fields) => {
            if (!err)
                res.send(
                    "UPDATE Sukses! \n { Request : " + JSON.stringify(req.body) + "\n}"
                );
            else console.log(err + "  " + JSON.stringify(req.body));
        }
    );
}); */

function authenticate(username, password) {
    var deferred = Q.defer();

    mysqlConnection.query(
        "SELECT users.username FROM users WHERE users.username LIKE '%" +
        username +
        "%'",
        (err, user, fields) => {
            if (!err) {

                if (user && bcrypt.compareSync(password, user.hash)) {
                    // authentication successful
                    deferred.resolve({
                        _id: user._id,
                        username: user.username,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        token: jwt.sign({
                            sub: user._id
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




    /* db.users.findOne({
        username: username
    }, function (err, user) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        if (user && bcrypt.compareSync(password, user.hash)) {
            // authentication successful
            deferred.resolve({
                _id: user._id,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                token: jwt.sign({
                    sub: user._id
                }, config.secret)
            });
        } else {
            // authentication failed
            deferred.resolve();
        }
    }); */

    return deferred.promise;
}

function getAll() {
    var deferred = Q.defer();

    mysqlConnection.query("SELECT * FROM users",
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


    /* db.users.find().toArray(function (err, users) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        // return users (without hashed passwords)
        users = _.map(users, function (user) {
            return _.omit(user, 'hash');
        });

        deferred.resolve(users);
    }); */

    return deferred.promise;
}

function getById(_id) {
    var deferred = Q.defer();

    mysqlConnection.query(
        "SELECT * FROM users WHERE users._id = ?",
        [_id],
        (err, row, fields) => {
            if (!err) {
                deferred.resolve(_.omit(row, 'hash'));
                //res.send(row);
            } else {
                deferred.reject(err.name + ': ' + err.message);
                console.log(err);
            }
        }
    );

    /* db.users.findById(_id, function (err, user) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        if (user) {
            // return user (without hashed password)
            deferred.resolve(_.omit(user, 'hash'));
        } else {
            // user not found
            deferred.resolve();
        }
    }); */

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



    /* // validation
    db.users.findOne({
            username: userParam.username
        },
        function (err, user) {
            if (err) deferred.reject(err.name + ': ' + err.message);

            if (user) {
                // username already exists
                deferred.reject('Username "' + userParam.username + '" is already taken');
            } else {
                createUser();
            }
        });
 */

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

        /* 
                db.users.insert(
                    user,
                    function (err, doc) {
                        if (err) deferred.reject(err.name + ': ' + err.message);

                        deferred.resolve();
                    }); */
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
                res.send("Delete Sukses!");
            } else {
                deferred.reject(err.name + ': ' + err.message);
                console.log(err + JSON.stringify(req.params.id));
            }
        }
    );

    /* db.users.remove({
            _id: mongo.helper.toObjectID(_id)
        },
        function (err) {
            if (err) deferred.reject(err.name + ': ' + err.message);

            deferred.resolve();
        }); */

    return deferred.promise;
}