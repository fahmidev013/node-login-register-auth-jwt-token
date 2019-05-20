var config = require('config.json');
var _ = require('lodash');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var Q = require('q');
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, {
  native_parser: true
});
db.bind('users');


var service = {};

service.authenticate = authenticate;
service.getAll = getAll;
service.getById = getById;
service.create = create;
service.update = update;
service.delete = _delete;

module.exports = service;


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
});