const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    product: {type: String, required: true},
    expPrice: {type: Number},
    expDate: {type: Date},
    postDate: {type: Date, default: Date.now},
    stock: {type: Number, required: true},
    provider: {type: String, required: true}
});

module.exports = mongoose.model('Stock', schema);