const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    provider: {type: String, unique: true, required: true},
    img: {type: String},
    branchOffices: [
        {
            branch: {type: String},
            address: {type: String}
        }
    ]
});

module.exports = mongoose.model('Provider', schema);