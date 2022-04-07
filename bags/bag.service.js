const db = require('_helpers/db');
const config = require('config.json');
const jwt = require('jsonwebtoken');
const ObjectId = require('mongodb').ObjectId;
const Bag = db.Bag;

module.exports = {
    create
};

async function create (providerId, userId, productId, quantity, name) {

    let bag = await Bag.findOne({ providerId, userId });

    if(bag) {

        bag.products.push({ productId, quantity, name });

    } else {

        bag = new Bag;
        bag.providerId = providerId;
        bag.userId = userId;
        bag.products.push({ productId, quantity, name });

    }

    await bag.save();
    return bag;

}