const db = require('_helpers/db');
const config = require('config.json');
const jwt = require('jsonwebtoken');
const ObjectId = require('mongodb').ObjectId;
const Bag = db.Bag;

module.exports = {
    create,
    getAll
};

async function create (orderId, providerId, productId, quantity, name) {  //pasar orderId, providerId, productId, quantity, name
    
    let bag = await Bag.findOne({ orderId, providerId });

    if(bag) {

        bag.products.push({ productId, quantity, name });

    } else {

        bag = new Bag;
        bag.orderId = orderId;
        bag.providerId = providerId;
        bag.products.push({ productId, quantity, name });

    }

    await bag.save();
    return bag._id;

}

async function getAll() {

    return await Bag.find();

}