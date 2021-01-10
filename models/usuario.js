var mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
var Reserva = require('./reserva');
var Schema = mongoose.Schema;

const bcrypt = require('bcrypt');
const saltRound = 10;
var crypto = require('crypto');

var Token = require('./token');
const mailer = require('../mailer/mailer');

const validateEmail = function (email) {
    const re = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    return re.test(email);
}

var usuarioSchema = new Schema({
    nombre: {
        type:String,
        trim: true,
        required: [true, 'El nombre es obligatorio']
    },
    email: {
        type:String,
        trim: true,
        required: [true, 'El email es obligatorio'],
        lowercase: true,
        validate: [validateEmail, 'Por favor ingrese un correo electrónico válido'],
        match: [/^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'La contraseña es obligatoria']
    },
    passwordResetToken: String,
    passwordResetTokenExpires: Date,
    verificado: {
        type: Boolean,
        default: false
    },
    googleId: String,
    facebookId: String
});

usuarioSchema.plugin(uniqueValidator, {message: 'El {PATH} ya existe con otro usuario'});

usuarioSchema.pre('save', function (next) {
    if (this.isModified('password')){
        this.password = bcrypt.hashSync(this.password, saltRound);
    }
    next();
})

usuarioSchema.methods.validPassword = function(password){
    var result = bcrypt.compareSync(password, this.password);
    if (result) {
        console.log("Password correcto");
    } else {
        console.log("Password incorrecto");
    }
    return result;
}



usuarioSchema.methods.reservar = function(biciId, desde, hasta, cb){
    var reserva = new Reserva({usuario: this._id, bicicleta: biciId, desde:desde, hasta: hasta});
    console.log(reserva);
    reserva.save(cb)
};

usuarioSchema.methods.enviar_email_bienvenida = function (cb) {
    const token = new Token({_userId: this._id,token: crypto.randomBytes(16).toString('hex')});
    const email_destination = this.email;

    console.log('token => ' + token);
    console.log('email destination => ' + email_destination);

    token.save(function( err ){
        if( err ) { return console.log(err.message); }

        const mailOptions = {
            from: 'no-reply@redbicicleta.com',
            to: email_destination,
            subject: 'Verificación de cuenta',
            text: 'Hola, \n\n'+' para verificar su cuenta haga click en este enlace: \n' + process.env.PORTAL_URL + '\/token/confirmation\/'+token.token + '\n'
        }

        mailer.sendMail(mailOptions, ( err )=> {
            if(err) { return console.log(err.message); }
            console.log('a verification email has been sent to ' + email_destination);
        });
    });
};

usuarioSchema.methods.resetPassword = function(cb) {
    const token = new Token({_userId: this._id,token: crypto.randomBytes(16).toString('hex')});
    const email_destination = this.email;

    console.log('token => ' + token);
    console.log('token => ' + email_destination);

    token.save(function( err ){
        if( err ) {
            return console.log(err.message);
        }

        const mailOptions = {
            from: 'no-reply@redbicicleta.com',
            to: email_destination,
            subject: 'Reestablecer password',
            text: 'Hola, \n\n'+' para reestablecer su password haga click en este enlace: \n' + process.env.PORTAL_URL + '\/resetPassword\/'+token.token + '\n'
        }

        mailer.sendMail(mailOptions, ( err )=> {
            if(err) { return console.log(err.message); }
            console.log('A reset password email has been sent to ' + email_destination);
        });
    });

};

usuarioSchema.statics.findOneOrCreateByGoogle = function findOneOrCreate(condition, callback){
    const self = this;
    self.findOne({
        $or: [
            {'googleId': condition.id}, {'email': condition.emails[0].value}
        ]}, (err, result) => {
            if (result){
                callback(err, result)
            } else {
                console.log(' --------------- CONDITION ---------------');
                console.log(condition);
                let values = {};
                values.googleId = condition.id;
                values.email = condition.emails[0].value;
                values.nombre = condition.displayName || 'SIN NOMBRE';
                values.verificado = true;
                values.password = condition._json.sub;
                console.log(' --------------- VALUES ---------------');
                console.log(values);
                self.create(values, (err, result) => {
                   if (err) {console.log(err);}
                   return callback(err, result)
                });
            }
    });
};

usuarioSchema.statics.findOneOrCreateByFacebook = function findOneOrCreate(condition, callback){
    const self = this;
    self.findOne({
        $or: [
            {'facebookId': condition.id}, {'email': condition.emails[0].value}
        ]}, (err, result) => {
        if (result){
            callback(err, result)
        } else {
            console.log(' --------------- CONDITION ---------------');
            console.log(condition);
            let values = {};
            values.facebookId = condition.id;
            values.email = condition.emails[0].value;
            values.nombre = condition.displayName || 'SIN NOMBRE';
            values.verificado = true;
            // Aquí se recomienda utilizar la estrategia de login
            values.password = crypto.randomBytes(16).toString('hex');
            console.log(' --------------- VALUES ---------------');
            console.log(values);
            self.create(values, (err, result) => {
                if (err) {console.log(err);}
                return callback(err, result)
            });
        }
    });
};

module.exports = mongoose.model('Usuario', usuarioSchema);
