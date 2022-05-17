const db = require('_helpers/db');
const config = require('config.json');
const jwt = require('jsonwebtoken');
const ObjectId = require('mongodb').ObjectId;
const Order = db.Order;
const Cart = db.Cart;
const Stock = db.Stock;
const Bag = db.Bag;
const User = db.User;
const bagService = require('../bags/bag.service');


module.exports = {
    create,
    openOrder,
    listOfOrders,
    inProgress,
    getAll,
    getById,
    changeStatus,
    cancelOrder
};

async function create (token, userParam) {

    let userId = '',
        orderId = '',
        productId = '',
        providerId = '',
        quantity,
        actualStock,
        name = '',
        img = '';

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

            let products = cart.products,
                order = new Order,
                orderBags = order.bags,
                existingBag = Boolean;

            order.userId = userId;
            orderId = order._id

            let address = {};

            address.street = userParam.street;
            address.streetNumber = userParam.streetNumber;
            address.floor = userParam.floor;
            address.door = userParam.door;
            address.CP = userParam.CP;

            order.address = address;

            let total = 0,
                productSubtotal = 0;

            for (const product of products) {

                providerId = product.providerId;
                productId = product.productId;
                quantity = product.quantity;

                productSubtotal = product.price * product.quantity;
                total = total + productSubtotal;

                let stock = await Stock.findOne({_id : ObjectId(productId)});

                if (stock) { //actualiza el stock de cada producto comprado. borra el objeto si se termina el stock, tira error si no hay suficiente stock

                    if (stock.stock < Number(quantity)) {

                        throw 'No hay suficiente stock para realizar esta compra'

                    }

                    if (stock.stock == Number(quantity)) {

                        name = stock.name;
                        img = stock.img;

                        await Stock.deleteOne({_id : ObjectId(productId)});

                    } else {

                        name = stock.name;
                        img = stock.img;

                        actualStock = Number(stock.stock);
                        actualStock = actualStock - Number(quantity);
                        stock.stock = actualStock;
                        await stock.save();

                    }                    

                } else {

                    throw 'Hubo un problema al actualizar el stock del producto';

                }
                
                existingBag = false;

                let bag = await bagService.create(orderId, providerId, productId, quantity, name, img); //manda a crear nueva bag/agregar producto a una bag existente

                let bagId = String(bag);

                for (const orderBag of orderBags) {

                    if (orderBag.bagId == bagId) {
                        existingBag = true;
                    }

                }

                if (!existingBag) order.bags.push({ bagId })    

            }

            order.total = total;

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

                    productArray.push({ 
                        name : product.name,
                        quantity : product.quantity,
                        img : product.img
                    });

                }

            } else {

                throw 'hubo un problema al reconocer las bags del pedido'

            }
        }

        let userAddress = order.address,
            orderId = order._id,
            status = order.status,
            total = order.total,
            date = order.date;

        return {
            orderId,
            date,
            status,
            productArray,
            total,
            userAddress
        };

    } else {

        throw 'no existe una orden con ese ID';

    }
}

async function listOfOrders(token) {

    let userId = '';

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

    let orderArray = [],
        order = {};

    const orders = await Order.find({ userId : userId}).sort('-date');
    console.log(orders);

    for (const item of orders) {

        order = await openOrder(item._id);

        orderArray.push({order});

    }

    return orderArray;
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
                order.status = 'Pendiente'
                break;
            case '2':
                order.status = 'En curso'
                break;
            case '3':
                order.status = 'Completada'
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


