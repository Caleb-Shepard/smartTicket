var express = require('express');
var app = express();
var passport = require('passport');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var mysql = require('mysql');
var fs = require('fs');
var replace = require("replace");
var mysqlDump = require("mysqldump");

// load config file
var config = {
	"mysql-username": "root",
	"mysql-password": "",
	"port": 80,
	"gmail_username": "smartticket0@gmail.com",
	"gmail_password": "password",
};
try {
	config = JSON.parse(fs.readFileSync('../config.json', 'utf8'));
} catch (e) {
	console.log('No config file found. Using defaults.');
}

// initialize the MySQL database connection
var mysqlConnection = mysql.createConnection({
	host: 'localhost',
	user: config['mysql-username'] || 'root',
	password: config['mysql-password'] || ''
});
mysqlConnection.query('USE smartTicket;');


require('./config/passport')(mysqlConnection, passport);

app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());

app.use(session({
	secret: 'vidyapathaisalwaysrunning',
	resave: true,
	saveUninitialized: true
 } ));

app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
require('./routes.js')(app, passport, express, mysqlConnection,replace,mysqlDump);

var port = parseInt(config['port']) || 80;
app.listen(port, function () {
    console.log('Example app listening on port %d!', port);
});
