var mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
var Reserva = require('./reserva');
var Token = require('./token');
const bcrypt = require('bcrypt');
var crypto = require('crypto');
const saltRound = 10;
const mailer = require('../mailer/mailer');
const emailRegex = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;


const validateEmail = function (email) {
    return emailRegex.test(email);
}

const requiredPassword = function () {
    return this.verificado == true;
}

var usuarioSchema = new mongoose.Schema({
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
        unique: true,
        validate: [validateEmail, 'Por favor ingrese un correo electrónico válido'],
        match: [emailRegex]
    },
    password: {
        type: String,
        required: [true, 'La contraseña es obligatoria'],
        default: ''
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
});

/*uitilidades*/
usuarioSchema.methods.toString = function () {
    return `nombre: ${this.nombre} | email: ${this.email}`;
}

/*CRUD Basico BEGIN***************************************/
usuarioSchema.statics.getAll = function (callback) {
    return this.find({}, callback);
}

usuarioSchema.statics.createInstance = function (nombre, email) {
    return new this({
        nombre,
        email
    });
}

usuarioSchema.statics.add = function (usuario, callback) {
    return this.create(usuario, callback);
}

usuarioSchema.statics.getById = function (id, callback) {
    return this.findOne({ _id: id }, callback);
}

usuarioSchema.statics.update = function (id, nombre, email, callback) {
    return this.findOneAndUpdate({ _id: id }, { nombre: nombre, email: email }, { returnNewDocument: true, runValidators: true, context: 'query' }, callback); // alternative use findByIdAndUpdate
}

usuarioSchema.statics.deleteById = function (id, callback) {
    return this.deleteOne({ _id: id }, callback);
}



/*************************CRUD Basico END******************/

/**************************  Login with google acount ************************/
usuarioSchema.statics.findOrCreateByGoogle = function (googleProfile, callback){
    console.log(' --------------- googleProfile ---------------');
    console.log(googleProfile);
    const self = this;
    self.findOne({
        $or: [{'googleId': googleProfile.id}, {'email': googleProfile.emails[0].value}]
    }, (err, result) => {
            if (result){
                console.log(' --------------- LO ENCONTRE!!! ---------------');
                callback(err, result)
            } else {
                let values = {
                    googleId: googleProfile.id,
                    email: googleProfile.emails[0].value,
                    nombre: googleProfile.displayName || 'SIN NOMBRE',
                    verificado: true,
                    password: crypto.randomBytes(16).toString('hex')
                };
                console.log(' --------------- VALUES ---------------');
                console.log(values);
                self.create(values, (err, result) => {
                   if (err) { 
                       return console.log(err.message);
                    }
                   return callback(err, result);
                });
            }
        });
};


/****************************** Login with facebook acount *******************/

usuarioSchema.statics.findOrCreateByFacebook = function (facebookProfile, callback) {
    console.log(' --------------- facebookProfile ---------------');
    console.log(facebookProfile);
    const self = this;
    self.findOne({
        $or: [{ 'facebookId': facebookProfile.id }, { 'email': facebookProfile.emails[0].value }]
    }, (err, result) => {
        if (result) {
            return callback(err, result);
        }
        else {
            let values = {
                facebookId: facebookProfile.id,
                email: facebookProfile.emails[0].value,
                nombre: facebookProfile.displayName || 'SIN NOMBRE',
                verificado: true,
                password: crypto.randomBytes(16).toString('hex')
            };
            console.log(' --------------- VALUES ---------------');
            console.log(values);
            self.create(values, (err, result) => {
                if (err) {
                    return console.log(err.message);
                }
                return callback(err, result);
            });
        }
    });
}


/****************  Utilidades para validacion   **********/

usuarioSchema.methods.validPassword = function(password){
    return bcrypt.compareSync(password, this.password);
}

usuarioSchema.methods.reservar = function(biciId, desde, hasta, callback){
    var reserva = new Reserva({usuario: this._id, bicicleta: biciId, desde:desde, hasta: hasta});
    console.log(reserva);
    reserva.save(callback);
};

usuarioSchema.methods.enviar_email_bienvenida = function (cb) {
    const token = new Token({_userId: this._id,token: crypto.randomBytes(16).toString('hex')});
    const nombreDestination = this.nombre;
    const emailDestination = this.email;
    token.save(function( err ){
        if( err ) { return console.log(err.message); }

        const mailOptions = {
            from: process.env.NODEMAILER_FROM,
            to: emailDestination,
            subject: 'Verificación de cuenta',
            text: `Hola ${nombreDestination}, \n\n` +' para verificar su cuenta haga click en este enlace: \n' + process.env.PORTAL_URL + '\/token/confirmation\/'+token.token + '\n'
        }

        mailer.sendMail(mailOptions, function (err){
            if(err) { 
                return console.log(err.message); 
            }
            console.log('a verification email has been sent to ' + emailDestination);
        });
    });
    return token;
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
            if(err) { 
                return console.log(err.message); 
            }
            console.log('A reset password email has been sent to ' + email_destination);
        });
    });
    return token;
};

module.exports = mongoose.model('Usuario', usuarioSchema);