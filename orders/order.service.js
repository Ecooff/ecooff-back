const db = require('_helpers/db');
const config = require('config.json');
const jwt = require('jsonwebtoken');
const ObjectId = require('mongodb').ObjectId;
const bagService = require('../bags/bag.service');
const startOfDay = require('date-fns/startOfDay');
const Order = db.Order;
const Cart = db.Cart;
const Stock = db.Stock;
const Bag = db.Bag;
const User = db.User;
const Provider = db.Provider;

module.exports = {
    changeBagStatus,
    getDailyOrdersLength,
    getDailyBags,
    getDeliveryScreenData,
    create,
    openOrder,
    listOfOrders,
    inProgress,
    getAll,
    getById,
    changeStatus,
    cancelOrder
};

async function changeBagStatus(userParam) {
    
    const order = await Order.findOne({_id : ObjectId(userParam.orderId)});
    const code = userParam.statusCode;
    const bags = order.bags;
    let stateChange = false;
    let orderStatusChange = true;

    if(order) {

        switch (code) {
            case '1':

                for (const bag of bags) {

                    if (bag.bagId == userParam.bagId) {
                        bag.bagStatus = 'Lista';
                        stateChange = true;
                    }

                }

                if(!stateChange) throw 'bagId erroneo';

                for (const bag of bags) {

                    if (bag.bagStatus != 'Lista') orderStatusChange = false;

                }

                if (orderStatusChange) order.status = 'Lista';

                break;
            case '2':

                for (const bag of bags) {

                    if (bag.bagId == userParam.bagId && bag.bagStatus == 'Lista') {
                        bag.bagStatus = 'Recogida';
                        stateChange = true;
                    }

                }

                if(!stateChange) throw 'bagId erroneo o la bag no esta lista.';

                for (const bag of bags) {

                    if (bag.bagStatus != 'Recogida') orderStatusChange = false;

                }

                if (orderStatusChange) order.status = 'Recogida';

                break;
        }

        await order.save();
        return order;
    } else throw 'orderId erroneo';

}

async function getDailyOrdersLength() {
    const orders = await Order.find({
        $or: [
            {
                $and: [
                    {status: {$in: ['Pendiente', 'Lista', 'Recogida']}},
                    {date: {$lt: startOfDay(new Date())}}
                ]
            },
            {
                $and: [
                    {status: 'Completada'},
                    {dateOfCompletion: startOfDay(new Date())}
                ]
            }
        ]        
    });

    let 
        ordersLength = orders.length,
        bagsLength = 0,
        providersLength = 0,
        ordersReadyLength = 0,
        ordersRetrievedLength = 0,
        ordersCompletedLength = 0,
        ordersReadyPercentage = 0,
        ordersRetrievedPercentage = 0,
        ordersCompletedPercentage = 0;

    if (orders) {

        for (const order of orders) {

            if (order.status == 'Lista') ordersReadyLength++;

            if (order.status == 'Recogida') ordersRetrievedLength++;

            if (order.status == 'Completada') ordersCompletedLength++;


            let bags = order.bags;

            bagsLength += bags.length;

            for (const bag of bags) {
                
                let fetchBag = await Bag.findOne({ _id: bag.bagId});

                if (fetchBag) {

                    let fetchBagProvider = await Provider.findOne({_id : ObjectId(fetchBag.providerId)});

                    if (fetchBagProvider) {

                        providersLength++;

                    } else {

                        throw 'Hubo un problema al buscar el proveedor de uno de los pedidos';

                    }

                } else {

                    throw 'hubo un problema al reconocer las bags de uno de los pedidos';

                }

            }

        }

    } else {

        throw 'no hay ordenes hoy'

    }

    ordersReadyPercentage = ordersReadyLength * 100 / ordersLength;
    ordersRetrievedPercentage = ordersRetrievedLength * 100 / ordersLength;
    ordersCompletedPercentage = ordersCompletedLength * 100 / ordersLength;

    return {

        ordersLength,
        providersLength,
        bagsLength,
        ordersReady : Number((parseFloat(ordersReadyPercentage + ordersRetrievedPercentage + ordersCompletedPercentage).toFixed(0))),
        ordersRetrieved : Number((parseFloat(ordersRetrievedPercentage + ordersCompletedPercentage).toFixed(0))),
        ordersCompleted : Number((parseFloat(ordersCompletedPercentage).toFixed(0)))

    }

}

async function getDailyBags() {

    const orders = await Order.find({
        $or: [
            {
                $and: [
                    {status: {$in: ['Pendiente', 'Lista', 'Recogida']}},
                    {date: {$lt: startOfDay(new Date())}}
                ]
            },
            {
                $and: [
                    {status: 'Completada'},
                    {dateOfCompletion: startOfDay(new Date())}
                ]
            }
        ]        
    });

    let
        bagsLength = 0,
        bagsReadyLength = 0,
        bagsReadyPercentage = 0,
        bagArray = [];

    if (orders) {

        for (const order of orders) {

            let bags = order.bags;

            for (const bag of bags) {

                let productsLength = 0;

                bagsLength++;

                if (bag.bagStatus != 'Pendiente') bagsReadyLength++;

                let fetchBag = await Bag.findOne({ _id: bag.bagId});

                if (fetchBag) {

                    let provider = await Provider.findOne({_id : fetchBag.providerId});

                    if (!provider) throw 'hubo un error al buscar los proveedores de las bags';

                    let
                        providerId = provider._id,
                        providerName = provider.name,
                        providerImg = provider.img,
                        providerAddress = provider.address,
                        products = fetchBag.products;

                    for (const product of products) productsLength += product.quantity;

                    bagArray.push({

                        orderId : order._id,
                        bagId : fetchBag._id,
                        productsLength : productsLength,
                        status : bag.bagStatus,
                        providerId : providerId,
                        providerName : providerName,
                        providerImg : providerImg,
                        providerAddress : providerAddress
                        
                    });

                } else throw 'hubo un problema al reconocer las bags de uno de los pedidos';

            }

        }

    } else throw 'no hay ordenes hoy';

    let finalArray = [];

    for (const bag of bagArray) {

        let itemIndex = finalArray.findIndex(p => p.providerId == bag.providerId.toString());

        console.log(typeof(bag.providerId), itemIndex);

        if(itemIndex == -1) {

            finalArray.push({

                providerId : bag.providerId.toString(),
                providerName : bag.providerName,
                providerImg : bag.providerImg,
                providerAddress : bag.providerAddress,
                bags: [
                    {

                        orderId : bag.orderId,
                        bagId : bag.bagId,
                        productsLength : bag.productsLength,
                        status : bag.status

                    }
                ]
            })

        } else {

            finalArray[itemIndex].bags.push({

                orderId : bag.orderId,
                bagId : bag.bagId,
                productsLength : bag.productsLength,
                status : bag.status

            })
        }
    }

    bagsReadyPercentage = bagsReadyLength * 100 / bagsLength;

    return {

        bagsReady : Number((parseFloat(bagsReadyPercentage).toFixed(0))),
        finalArray       

    }

}

async function getDeliveryScreenData(status) {

    let orders = {};

    if(status == 'All') { //agregar validacion para minusuclas

        orders = await Order.find({
            $or: [
                {
                    $and: [
                        {status: 'Recogida'},
                        {date: {$lt: startOfDay(new Date())}}
                    ]
                },
                {
                    $and: [
                        {status: 'Completada'},
                        {dateOfCompletion: startOfDay(new Date())}
                    ]
                }
            ]        
        });

    } else if(status == 'Completada') {

        orders = await Order.find({
            $and: [
                {status},
                {dateOfCompletion: startOfDay(new Date())}
            ]       
        });

    } else if(status == 'Recogida') {

        orders = await Order.find({
            $and: [
                {status},
                {date: {$lt: startOfDay(new Date())}}
            ]       
        });

    } else throw 'estado invalido. La primer letra debe ser mayuscula, las opciones son All, Recogida y Completada.'

    let 
        ordersLength = orders.length,
        bagsLength = 0,
        ordersCompletedLength = 0,
        ordersCompletedPercentage = 0;

    if (!orders) throw 'no hay ordenes hoy';

    let 
        orderArray = [],
        orderInfo = {};

    for (const item of orders) {

        if (item.status == 'Completada') ordersCompletedLength++;

        const user = await User.findOne({_id : item.userId});

        if (!user) throw 'Hubo un problema al recuperar los datos de un usuario comprador';

        let bags = item.bags;

        bagsLength = bags.length;

        orderInfo = await openOrder(item._id);

        let userAddress = orderInfo.userAddress[0];

        orderArray.push({

            orderId : orderInfo.orderId,
            date : orderInfo.date,
            status : orderInfo.status,
            userName : user.firstName + ' ' + user.lastName,
            bagsLength,
            street : userAddress.street,
            streetNumber : userAddress.streetNumber,
            floor : userAddress.floor,
            door : userAddress.door,
            CP : userAddress.CP

        });

    }

    ordersCompletedPercentage = ordersCompletedLength * 100 / ordersLength;

    if(typeof(ordersCompletedPercentage) != Number) ordersCompletedPercentage = 0;
    if(ordersLength == null) ordersLength = 0;

    return {

        ordersCompleted : Number((parseFloat(ordersCompletedPercentage).toFixed(0))),
        ordersLength,
        orderArray

    }

}

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

                        throw 'No hay suficiente stock para realizar esta compra';

                    }

                    let user = await User.findById(userId);

                    if (user) {

                        let favorites = user.favorites,
                            favBool = false;

                        if (favorites.length > 0) {

                            for (const favorite of favorites) {

                                if (favorite.subcategory == stock.subcategory) {

                                    favorite.count++;
                                    favBool = true;

                                    await user.save();

                                }

                            }

                            if (!favBool) {

                                user.favorites.push({

                                    subcategory : stock.subcategory,
                                    count : 1
    
                                })

                                await user.save();

                            }

                        } else {

                            user.favorites.push({

                                subcategory : stock.subcategory,
                                count : 1

                            })

                            await user.save();

                        }

                    } else {

                        throw 'Hubo un problema al recuperar el usuario';

                    }

                    if (stock.stock == Number(quantity)) {

                        name = stock.name;
                        img = stock.img;

                        //await Stock.deleteOne({_id : ObjectId(productId)});

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

            //await Cart.deleteOne({_id : ObjectId(cart.id)});

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

                throw 'hubo un problema al reconocer las bags del pedido';

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

    let 
        orderArray = [],
        order = {};

    const orders = await Order.find({ userId : userId}).sort('-date');

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
    let bags = order.bags;

    if(order) {
        switch (code) {

            case '1':

                for (const bag of bags) {

                    if (bag.bagStatus != 'Lista') throw 'Todas las bolsas deben estar listas para realizar esta accion.';

                }

                order.status = 'Lista';
                break;
            case '2':
                
                for (const bag of bags) {

                    if (bag.bagStatus != 'Recogida') throw 'Todas las bolsas deben estar recogidas para realizar esta accion.';

                }

                order.status = 'Recogida';
                break;
            case '3':

                for (const bag of bags) {

                    if (bag.bagStatus != 'Recogida') throw 'Todas las bolsas deben estar recogidas para realizar esta accion.';

                }

                for (const bag of bags) {

                    bag.bagStatus = 'Completada';

                }

                order.status = 'Completada';
                order.dateOfCompletion = startOfDay(new Date());
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