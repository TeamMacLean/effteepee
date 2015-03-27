var express = require('express');
var path = require('path');
var logger = require('morgan');
var mongoose = require('mongoose');
var session = require('express-session');
var flash = require('connect-flash');
var MongoStore = require('connect-mongo')(session);
var bodyParser = require('body-parser');
var passport = require('passport');
var routes = require('./routes/index');
var auth = require('./routes/auth');

var DB_NAME = 'effteepee';
var DB_HOST = 'localhost';
var DB_URI = 'mongodb://' + DB_HOST + '/' + DB_NAME;
var DB_PORT = 27017;

var app = express();


var genSecret = function () {
    var secret = "", rand;
    for (var i = 0; i < 36; i++) {
        rand = Math.floor(Math.random() * 15);
        if (rand < 10) {
            // for 0-9
            secret += String.fromCharCode(48 + rand);
        } else {
            // for a-f
            secret += String.fromCharCode(97 + (rand - 10));
        }
    }
    return secret;
};

app.use(session({
    secret: genSecret(),
    // cookie: {
    // expires: false
    // },
    store: new MongoStore({
        host: DB_HOST,
        port: DB_PORT,
        db: DB_NAME
    }),
    resave: true,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use(function (req, res, next) {
    var info = req.flash('info');
    var error = req.flash('error');
    var success = req.flash('success');

    if (info.length > 0) {
        res.locals.info = info;
    }
    if (success.length > 0) {
        res.locals.success = success;
    }
    if (error.length > 0) {
        res.locals.error = error;
    }
    next(null, req, res);
});

//DB
var db = mongoose.connection;
var dbURI = DB_URI;
db.on('error', function (error) {
    console.log('mongoose error', error);
    mongoose.disconnect();
});
db.on('disconnected', function () {
    mongoose.connect(dbURI, {server: {auto_reconnect: true}});
});
mongoose.connect(dbURI, {server: {auto_reconnect: true}});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//app.use(logger('dev'));


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use(function (req, res, next) {

    if (req.user != null) {
        res.locals.signedInUser = {};
        res.locals.signedInUser.username = req.user.username;
    }
    next(null, req, res);
});


app.use('/', auth);
app.use('/', routes);

app.use(express.static(path.join(__dirname, 'public')));

module.exports = app;
