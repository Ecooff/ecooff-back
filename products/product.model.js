const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    name: {type: String, required: true},
    category: {type: String},
    subcategory: {type: String},
    description: {type: String},
    listPrice: {type: Number},
    img: {type: String},
    allergenics: [
        {
            vegan: {type: Boolean},
            celiac: {type: Boolean}
        }
    ]
});

module.exports = mongoose.model('Product', schema);