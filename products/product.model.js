const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    title: {type: String, required: true, unique: true},
    category: {type: String},
    subCategory: {type: String},
    price: {type: Number},
    img: {type: String}
});

module.exports = mongoose.model('Product', schema);