var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');

var config = require('../config.json');

var User = require('../models/User');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy(
    function (username, password, done) {
        User.findOne({username: username}, function (err, user) {
            if (err) {
                return done(err);
            }
            if (!user) {
                console.log('User Not Found with username ' + username);
                return done(null, false, {message: 'User Not found.'});
            }
            if (!isValidPassword(user, password)) {
                console.log('Invalid Password');
                return done(null, false, {message: 'Invalid Password'});
            }
            // User and password both match, return user from
            // done method which will be treated like success
            return done(null, user);
        });
    }
));


passport.serializeUser(function (user, done) {
    done(null, user._id);
});

passport.deserializeUser(function (id, done) {

    User.findById(id, function (err, user) {
        done(err, user);
    });
});

var isValidPassword = function (user, password) {
    return bcrypt.compareSync(password, user.password);
};


router.get('/signin', function (req, res) {

    res.render('signin', {title: config.appName});
});
/* Handle Login POST */
router.post('/signin', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/signin',
    failureFlash: true
}));

router.get('/signout', function (req, res) {
    req.logout();
    res.status(200).redirect('/');
});

module.exports = router;