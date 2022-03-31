const db = require('_helpers/db');
const config = require('config.json');
const jwt = require('jsonwebtoken');
const Order = db.Order;
const Cart = db.Cart;
const Stock = db.Stock;
const ObjectId = require('mongodb').ObjectId;

module.exports = {
    create,
    inProgress,
    getAll,
    getById,
    changeStatus,
    cancelOrder,
    getByUserId
};

async function create (token) {

    let userId = '';
    let productId = '';
    let providerId = '';
    let quantity;
    let name = '';
    let price;
    let actualStock;

    if (token) {
        
        jwt.verify(token, config.secret, (err, decoded) => {
            if (err){
                console.log(err.message);
                throw 'error';
            } else {
                userId = decoded.sub;
            }
        });
    }

    try {
        let cart = await Cart.findOne({userId: userId});

        if(cart){

            let products = cart.products;
            let order = new Order;

            order.userId = userId;

            products.forEach(async (item) => {

                productId = item.productId;
                providerId = item.providerId;
                quantity = item.quantity;
                name = item.name;

                let itemIndex = order.bags.findIndex(p => p.providerId == providerId);

                if (itemIndex > -1) {

                    let existingBag = order.bags[itemIndex];
                    existingBag.products.push({ productId, quantity, name });

                }   else {

                    let newBag = order.bags;
                    console.log(newBag);
                    console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
                    newBag.providerId = providerId;
                    newBag.products.push({ productId, quantity, name });

                }

                let stock = await Stock.findOne({_id : ObjectId(productId)});

                actualStock = Number(stock.stock);

                console.log(actualStock);

                actualStock = actualStock - Number(quantity);

                stock.stock = actualStock;

                await stock.save();

            })

            order = await order.save();

            await Cart.deleteOne({_id : ObjectId(cart.id)});

            return order;

        } else {

            throw 'El carrito esta vacio';

        }
    } catch(err) {

        console.log(err);
        
    }
}

async function inProgress() {  //hacer para los otros estados tmb, y que traiga el user address a traves del user id
    let orders = await Order.find({ status : 'In Progress' });

    return orders;
}

async function getAll() {
    return await Order.find();
}

async function getById(id) {
    return await Order.findById(ObjectId(id));
}

async function changeStatus(userParam) {
    const order = await Order.findOne({_id : ObjectId(userParam.id)});
    const code = userParam.statusCode;

    if(order) {
        switch (code) {
            case '1':
                order.status = 'Pending'
                break;
            case '2':
                order.status = 'In Progress'
                break;
            case '3':
                order.status = 'Completed'
                break;
        }

        await order.save();
        return order;
    }
}

async function cancelOrder(userParam) {
    await Order.deleteOne({_id : ObjectId(userParam.id)});

    return;
}

async function getByUserId(userParam) {
    const orders = await Order.find({ userId : userParam.userId});

    return orders;
}


