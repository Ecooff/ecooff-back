const db = require('_helpers/db');
const secret = process.env.SECRET_KEY;
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
    getOrderDetail,
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

    let groupedOrders = orders.reduce((objectsByKeyValue, obj) => {
        const value = obj['status'];
        objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj);
        return objectsByKeyValue;
    }, {});

    let
        readys = (groupedOrders.Lista || []),
        retrieveds = (groupedOrders.Recogida || []),
        completeds = (groupedOrders.Completada || []);

    let 
        readyLength = readys.length,
        retrievedLength = retrieveds.length,
        completedLength = completeds.length,

        ordersReadyPercentage = readyLength * 100 / orders.length,
        ordersRetrievedPercentage = retrievedLength * 100 / orders.length,
        ordersCompletedPercentage = completedLength * 100 / orders.length;

    

    let ordersId = orders.map((order) => order._id);

    const bags = await Bag.find({orderId : ordersId});

    let providersId = [];

    bags.forEach((bag) => {

        !providersId.includes(bag.providerId) && providersId.push(bag.providerId);

    })

    const providers = await Provider.find({_id : providersId});

    return {

        ordersLength : orders.length,
        bagsLength : bags.length,
        providersLength : providers.length,
        ordersReady : Number((parseFloat(ordersReadyPercentage + ordersRetrievedPercentage + ordersCompletedPercentage).toFixed(0))),
        ordersRetrieved : Number((parseFloat(ordersRetrievedPercentage + ordersCompletedPercentage).toFixed(0))),
        ordersCompleted : Number((parseFloat(ordersCompletedPercentage).toFixed(0)))

    };

}

async function getDailyBags(code) {

    let 
        orders,
        options;

    switch(code) {

        case '0':
            options = ['Pendiente', 'Lista', 'Recogida'];
        break;

        case '1':
            options = ['Lista'];
        break;

        case '2':
            options = ['Recogida'];
        break;

        default:
            return 'opciones: 0 = todos, 1 = listas, 2= recogidas'; // trae bags

    }

    orders = await Order.find({
        $and: [
            {status: {$in: options}},
            {date: {$lt: startOfDay(new Date())}}
        ]      
    });

    if (!orders) throw 'no hay ordenes hoy';

    let ordersId = orders.map((order) => order._id);

    const bags = await Bag.find({orderId : ordersId});

    let providersId = [];

    bags.forEach((bag) => !providersId.includes(bag.providerId) && providersId.push(bag.providerId));

    const providers = await Provider.find({_id : providersId});

    let 
        finalArray = [],
        bagsReadyLength = 0;

    bags.forEach((bag) => {

        let
            bagIndex = finalArray.findIndex(b => b.providerId == bag.providerId),
            orderIndex = orders.findIndex(o => o._id == bag.orderId),
            statusIndex = orders[orderIndex].bags.findIndex(s => s.bagId == bag._id);

            bag.status = orders[orderIndex].bags[statusIndex].bagStatus;

        bag.status == 'Lista' && bagsReadyLength++

        let newBag = [
            {
                _id : bag._id,
                bagId : bag._id,
                status : bag.status,
                products : bag.products,
                orderId : bag.orderId,
                providerId : bag.providerId
            }
        ]

        if(bagIndex > -1) {

            finalArray[bagIndex].bags.push(newBag[0])

        } else {

            let providerIndex = providers.findIndex(p => p._id == bag.providerId);
            
            finalArray.push({

                providerId : bag.providerId,
                providerName : providers[providerIndex].name,
                providerImg : providers[providerIndex].img,
                providerAddress : providers[providerIndex].address[0],
                bags: newBag

            })

        }

    });

    finalArray.forEach((provider, i) => {

        let readyLength = provider.bags.filter(item => item.status == 'Lista').length,
            provReadyPercentage = readyLength * 100 / provider.bags.length;

        finalArray[i].bagsReady =  Number(provReadyPercentage.toFixed(0));

    });

    let bagsReadyPercentage = bagsReadyLength * 100 / bags.length;

    return {

        bagsReady : Number(bagsReadyPercentage.toFixed(0)),
        finalArray

    }
}

async function getDeliveryScreenData(status) {

    let orders;

    if (status == 'All') {
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
    } else {
        orders = await Order.find({
            $and: [
                { status },
                { date: { $lt: startOfDay(new Date()) } }
            ]     
        });
    }

    console.log(orders);

    if (!orders) throw 'no hay ordenes hoy';

    let 
        ordersLength = orders.length,
        bagsLength = 0,
        ordersCompletedLength = 0,
        ordersCompletedPercentage = 0;

    let 
        orderArray = [],
        order = {};

    let usersId = orders.map((order) => order.userId);

    const users = await User.find({_id : usersId});

    for (const item of orders) {

        if (item.status == 'Completada') ordersCompletedLength++;

        let bags = item.bags;

        bagsLength = bags.length;

        order = await openOrder(item._id);

        let userAddress = order.userAddress[0];

        let userIndex = users.findIndex(u => u._id == item.userId);

        orderArray.push({

            orderId : order.orderId,
            date : order.date,
            status : order.status,
            userName : users[userIndex].firstName + ' ' + users[userIndex].lastName,
            bagsLength,
            street : userAddress.street,
            streetNumber : userAddress.streetNumber,
            floor : userAddress.floor,
            door : userAddress.door,
            CP : userAddress.CP

        });

    }

    ordersCompletedPercentage = ordersCompletedLength * 100 / ordersLength;

    if(typeof(ordersCompletedPercentage) != 'number') ordersCompletedPercentage = 0;
    if(ordersLength == null) ordersLength = 0;

    return {

        ordersCompleted : ordersCompletedPercentage,
        ordersLength,
        orderArray

    }

}

async function getOrderDetail(id) {

    let order = await Order.findOne({ _id : id });

    if (!order) throw 'No existe una orden con ese ID.';

    let 
        user = await User.findOne({ _id : order.userId }),
        bags = order.bags;

    if (!user) throw 'Hubo un problema al recuperar los datos del comprador.';

    let 
        username = user.firstName + ' ' + user.lastName;
        bagArray = [];

    for (const bag of bags) {

        let fetchBag = await Bag.findOne({ _id: bag.bagId });

        if (!fetchBag) throw 'Hubo un problema al reconocer las bags del pedido.';

        let provider = await Provider.findOne({ _id : fetchBag.providerId });

        if (!provider) throw 'Hubo un problema al buscar los datos del proveedor.';

        let 
            products = fetchBag.products,
            productArray = [];

        for (const product of products) {

            productArray.push({ 
                productId : product.productId,
                name : product.name,
                quantity : product.quantity,
                img : product.img
            });

        }

        bagArray.push({
            provderId : provider._id,
            providerName : provider.name,
            providerImg : provider.img,
            productArray
        });

    }

    return {

        orderId : order.id,
        status : order.status,
        username,
        userAddress : order.address[0],
        bagArray
        

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
        
        jwt.verify(token, secret, (err, decoded) => {
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

async function listOfOrders(token, status) {

    let userId = '';

    if (token) {
        
        jwt.verify(token, secret, (err, decoded) => {
            if (err){
                console.log(err.message);
                throw 'error';
            } else {
                userId = decoded.sub;
            }
        });
    }

    let orderArray = [],
        order = {},
        orders;

    if (status == 0) {

        orders = await Order.find({ userId : userId, status : {$in:['Pendiente', 'Lista', 'Recogida']}}).sort('-date');

    } else if(status == 1) {

        orders = await Order.find({ userId : userId, status : 'Completada'}).sort('-date');

    } else if(status == 2) {

        orders = await Order.find({ userId : userId}).sort('-date');

    } else {

        throw 'Codigo de estado incorrecto, enviar 0 (No completadas), 1 (Completadas) o 2 (Todas).';

    }

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