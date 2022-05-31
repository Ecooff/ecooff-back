const { id } = require('date-fns/locale');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    date: {type: Date, default: Date.now},
    userId: {type: String},
    status: {type: String, default: 'Pendiente'},
    dateOfCompletion: {type:String},
    total: {type: Number},
    bags:[
        {
            bagId: {type: String},
            bagStatus: {type: String, default: 'Pendiente'}
        }
    ],
    address:[
        {
            street: {type: String, required: true},
            streetNumber: {type: Number, required: true},
            floor: {type: Number},
            door: {type: String},
            CP: {type: Number, required: true}
        }
    ]
});

module.exports = mongoose.model('Order', schema);