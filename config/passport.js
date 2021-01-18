const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
var GoogleStrategy = require('passport-google-oauth20').Strategy;
var FacebookTokenStrategy = require('passport-facebook-token');
const Usuario = require('../models/usuario');

passport.use(new LocalStrategy( function(email, password, done){
        Usuario.findOne({email: email}, function(err, usuario) {
            if(err) {
                return done(err);
            }
            if(!usuario){
                return done(null, false, {message:'email no existe o incorrecto'});
            }
            if(!usuario.validPassword(password)) {
                return done(null, false, {message:'password incorrecto'});
            }
            return done(null, usuario);
        });
    }
));

passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.PORTAL_URL + "/auth/google/callback"
    },
    function(request,accessToken, refreshToken, profile, done) {
        console.log(profile);
        Usuario.findOrCreateByGoogle(profile, function (err, user) {
            return done(err, user);
        });
    }
));

passport.use(new FacebookTokenStrategy({
        clientID: process.env.FACEBOOK_ID,
        clientSecret: process.env.FACEBOOK_SECRET,
        callbackURL: process.env.PORTAL_URL+"/auth/facebook/callback"
    },
    function(accessToken, refreshToken, profile, cb) {
        try {
            console.log(profile);
            Usuario.findOrCreateByFacebook(profile, function (err, user) {
                if (err) console.log('err' + err);
                return cb(err, user);
            });
        } catch (err2) {
            console.log(err2);
            return cb(err2, null);
        }
    }
));

passport.serializeUser(function(user, cb){
    cb(null, user.id);
});

passport.deserializeUser(function(id, cb){
    Usuario.findById(id, function(err, usuario){
        cb(null, usuario);
    })
});

module.exports = passport
