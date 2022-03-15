const db = require('_helpers/db');
const config = require('config.json');
const jwt = require('jsonwebtoken');
const Order = db.Order;
const Cart = db.Cart;
const ObjectId = require('mongodb').ObjectId;

module.exports = {
    create,
    getAll,
    getById,
    inProgress,
    changeStatus,
    cancelOrder,
    getByUserId
};

async function create (token) {
    let userId = '';
    let productId = '';
    let quantity = '';
    let name = '';
    let price = '';
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
        let products = cart.products;

        if(cart){
            let order = new Order;

            order.userId = userId;

            products.forEach((item) => {

                productId = item.productId;
                quantity = item.quantity;
                name = item.name;
                price = item.price;

                order.products.push({ productId, quantity, name, price });
            })

            order = await order.save();

            await Cart.deleteOne({_id : ObjectId(cart.id)});

            return order;
        } else {
            throw 'El carrito esta vacio'
        }
    } catch(err) {
        console.log(err);
    }
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

async function inProgress() {
    console.log('here');
    //let orders = await Order.find({ status : 'In Progress' });

    //console.log(orders);

    //return orders;
}