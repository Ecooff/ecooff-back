const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    email: {type: String, unique:true, reqired:true},
    hash: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    verified: {type: Boolean, default: false},
    verificationToken: {type: String},
    // Favorites: [
    //     {
    //         subcategoryId: gaseosas
    //         count:++
    //     }
    // ],
    forgotPwToken: {type: String}
});

schema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        delete ret._id;
        delete ret.hash;
    }
});

module.exports = mongoose.model('User', schema);