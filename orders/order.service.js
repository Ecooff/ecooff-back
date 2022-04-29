const db = require('_helpers/db');
const config = require('config.json');
const jwt = require('jsonwebtoken');
const ObjectId = require('mongodb').ObjectId;
const Order = db.Order;
const Cart = db.Cart;
const Stock = db.Stock;
const Bag = db.Bag;
const bagService = require('../bags/bag.service');
const { concat } = require('../cart/cart.service');


module.exports = {
    create,
    openOrder,
    inProgress,
    getAll,
    getById,
    changeStatus,
    cancelOrder,
    getByUserId
};

async function create (token) {

    let userId = '';
    let orderId = '';
    let productId = '';
    let providerId = '';
    let quantity;
    let name = '';
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

        let cart = await Cart.findOne({ userId: userId });

        if(cart){

            let products = cart.products;
            let order = new Order;
            let orderBags = order.bags;
            let existingBag = Boolean;

            order.userId = userId;
            orderId = order._id

            for (const product of products) {

                providerId = product.providerId;
                productId = product.productId;
                quantity = product.quantity;
                name = product.name;
                
                existingBag = false;

                let bag = await bagService.create(orderId, providerId, productId, quantity, name); //manda a crear nueva bag/agregar producto a una bag existente

                let bagId = String(bag);

                for (const orderBag of orderBags) {

                    if (orderBag.bagId == bagId) {
                        existingBag = true;
                    }

                }

                if (!existingBag) order.bags.push({ bagId })

                

                let stock = await Stock.findOne({_id : ObjectId(productId)});

                if (stock) { //actualiza el stock de cada producto comprado

                    actualStock = Number(stock.stock);
                    actualStock = actualStock - Number(quantity);
                    stock.stock = actualStock;
                    await stock.save();

                } else {

                    console.log('el stock no fue actualizado');

                }
            }

            await order.save();

            await Cart.deleteOne({_id : ObjectId(cart.id)});

            return order;

        } else {

            throw 'El carrito esta vacio';

        }
    } catch(err) {

        console.log(err);
        
    }
}

async function openOrder(id) {

    let order = await Order.findOne({ _id: id });

    if (order) {

        let bags = order.bags;

        let productArray = [];

        for (const bag of bags) {

            let fetchBag = await Bag.findOne({ _id: bag.bagId});

            if (fetchBag) {

                let products = fetchBag.products;

                for (const product of products) {

                    let stock = await Stock.findOne({ _id : product.productId }, ['name', '-_id']);

                    if (stock) {

                        productArray.push({ stock });

                    } else {

                        throw 'hubo un problema al buscar los productos de las bags';

                    }

                }

            } else {

                throw 'hubo un problema al reconocer las bags del pedido'

            }
        }

        return productArray;

    } else {

        throw 'no existe una orden con ese ID';

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

async function getByUserId(id) {
    const orders = await Order.find({ userId : id});

    return orders;
}


