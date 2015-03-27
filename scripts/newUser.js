#!/usr/bin/env node

require('../app');
var mongoose = require('mongoose');
var User = mongoose.model('User');

var args = process.argv.slice(2);

//console.log(args);

var username = args[0];
var password = args[1];
var email = args[2];

if (username && password && email && username.length > 0 && password.length > 0 && email.length > 0) {

    console.log('creating user');

    var u = User({username: username, password: password, email: email});

    u.save(function (err, user) {
        if (err) {
            console.log('ERROR', err);
            exit(1);
        } else {
            console.log('CREATED USER', u);
            exit(0);
        }
    });

} else {
    console.log('bad input');
    exit(1);
}

function exit(code) {

    if (code > 0) {
        printUse();
    }

    process.exit(code);
}

function printUse() {
    var use = 'usage: newUser [username password email]';
    console.log(use);
}
