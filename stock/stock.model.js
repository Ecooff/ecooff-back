const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    title: {type: String, required: true},
    modelId: {type: String, required: true},
    category: {type: String},
    subcategory: {type: String},
    expPrice: {type: Number},
    expDate: {type: Date},
    postDate: {type: Date, default: Date.now},
    stock: {type: Number, required: true},
    img: {type: String},
    providerId: {type: String},
    providerName: {type: String},
    providerBranch: {type: String},
    branchGeo: {type: String}
});

module.exports = mongoose.model('Stock', schema);