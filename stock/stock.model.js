const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    modelId: {type: String, required: true},
    name: {type: String, required: true},
    category: {type: String},
    subcategory: {type: String},
    description: {type: String},
    listPrice: {type: Number},
    img: {type: String},
    expPrice: {type: Number},
    expDate: {type: Date},
    postDate: {type: Date, default: Date.now},
    stock: {type: Number, required: true},
    providerId: {type: String},
    providerName: {type: String}
});

module.exports = mongoose.model('Stock', schema);