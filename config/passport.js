var LocalStrategy = require('passport-local').Strategy;
var user = require('../models/user');
var config = require('../config/database');
var bcrypt = require('bcryptjs');

module.exports = function(passport){
    passport.use(new LocalStrategy(function (username, password, done ) {
        var query = {username: username};
        user.findOne(query, function(err, user){
            if (err) {return done(err)};
            if (!user){
                return done(null, false, {message: "User not found"})
            }

            if (!user.active){
                return done(null, false, {message:"You must verify your email first. Check your inbox."})
            }

            bcrypt.compare(password, user.password, function(err, isMatch){
                if(err) throw err;
                if (isMatch) {
                    return done(null,user);
                } else {
                    return done(null, false, {message:"Wrong password"})
                }
            })

        });
    }))

    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });
    passport.deserializeUser(function (id, done) {
        user.findById(id, function(err, user){
            done(err, user);
        });
    });
}
