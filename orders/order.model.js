const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    userId: {type: String},
    status: {type: String, default: 'Pending'},
    products: [
        {
            productId: {type: String},
            quantity: {type: Number},
            name: {type: String},
            price: {type: Number},
        }
    ],
});

module.exports = mongoose.model('Order', schema);