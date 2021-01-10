var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var tokenSchema = new Schema({
    _userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'El token es requerido'],
        ref: 'Usuario'
    },
    token: {
        type: String,
        trim: true
    },
    createdAt: {
        type: Date,
        required: [true, 'La fecha de creación es requerida'],
        default: Date.now,
        expires: 43200
    }
});

module.exports = mongoose.model('Token', tokenSchema);
