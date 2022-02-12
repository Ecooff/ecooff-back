const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    title: {type: String, required: true},
    productId: {type: String, required: true},
    subcategory: {type: String},
    expPrice: {type: Number},
    expDate: {type: Date},
    postDate: {type: Date, default: Date.now},
    stock: {type: Number, required: true},
    img: {type: String},
    provider: {type: String, required: true}
});

module.exports = mongoose.model('Stock', schema);