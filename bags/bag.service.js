const db = require('_helpers/db');
const Bag = db.Bag;

module.exports = {
    create,
    getAll
};

async function create (orderId, providerId, productId, quantity) {  //pasar orderId, providerId, productId, quantity
    
    let bag = await Bag.findOne({ orderId, providerId });

    if(bag) {

        bag.products.push({ productId, quantity });

    } else {

        bag = new Bag;
        bag.orderId = orderId;
        bag.providerId = providerId;
        bag.products.push({ productId, quantity });

    }

    await bag.save();
    return bag._id;

}

async function getAll() {

    return await Bag.find();

}