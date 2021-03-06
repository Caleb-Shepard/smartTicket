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
	"mysql_username": "root",
	"mysql_password": "",
    "mysql_port": 3306,
	"port": 80,
	"gmail_username": "smartticket0@gmail.com",
	"gmail_password": "password",
};
try {
	config = JSON.parse(fs.readFileSync('../config.json', 'utf8'));
} catch (e) {
	console.log('No config file found. Using defaults.');
}

var port = parseInt(config['port']) || 80;
const REFRESH_FREQUENCY = .5; // in minutes

// initialize the MySQL database connection
var mysqlConnection = mysql.createConnection({
	host: 'localhost',
	user: config['mysql_username'] || 'root',
	password: config['mysql_password'] || '',
    port: parseInt(config['mysql_port']) || 3306,
    database: 'smartTicket',
});

// check for new emails ever 30 seconds
var mail = require('../mail/mail.js')(mysqlConnection, config, port);
var refreshMail = function() {
	mail.handleUpdates(function(err, newCount) {
		if (err) {
			console.error('Error refreshing email:', err);
		} else {
			console.log('Refreshed email data (' + newCount + ' new).');
		}
	});
}
refreshMail();
setInterval(refreshMail, 1000 * 60 * REFRESH_FREQUENCY);


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
require('./routes.js')(app, passport, express, mysqlConnection,replace,mysqlDump,mail);

app.listen(port, function () {
    console.log('Example app listening on port %d!', port);
});
