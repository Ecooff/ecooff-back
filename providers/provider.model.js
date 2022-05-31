const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    name: {type: String, required: true},
    img: {type: String},
    address:[
        {
            street: {type: String, required: true},
            streetNumber: {type: Number, required: true},
            CP: {type: Number, required: true}
        }
    ]
});

module.exports = mongoose.model('Provider', schema);