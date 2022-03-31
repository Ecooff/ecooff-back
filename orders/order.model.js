const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    userId: {type: String},
    status: {type: String, default: 'Pending'},
    bags:[
        {
            providerId: {type: String},
            products: [
                {
                    productId: {type: String},
                    quantity: {type: Number},
                    name: {type: String}
                }
            ]
        }
    ]
});

module.exports = mongoose.model('Order', schema);