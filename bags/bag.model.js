const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    userId: {type: String},
    providerId: {type: String},
    products: [
        {
            productId: {type: String},
            quantity: {type: Number},
            name: {type: String}
        }
    ]
});

module.exports = mongoose.model('Bag', schema);