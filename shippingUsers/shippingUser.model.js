const 
    mongoose = require('mongoose'),
    Schema = mongoose.Schema;

const schema = new Schema({
    email: {type: String, unique:true, reqired:true},
    hash: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true }
});

schema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        delete ret._id;
        delete ret.hash;
    }
});

module.exports = mongoose.model('ShippingUser', schema);