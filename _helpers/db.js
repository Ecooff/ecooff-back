const config = require('config.json');
const mongoose = require('mongoose');
const connectionOptions = { useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false };
mongoose.connect("mongodb+srv://ecooffAdmin:vD9uJTn3@cluster0.jm6mh.mongodb.net/myFirstDatabase?retryWrites=true&w=majority" || config.connectionString, connectionOptions);
mongoose.Promise = global.Promise;

module.exports = {
    User: require('../users/user.model'),
    Category: require('../categories/category.model'),
    Provider: require('../providers/provider.model'),
    Product: require('../products/product.model'),
    Stock: require('../stock/stock.model'),
    Cart: require('../cart/cart.model'),
    Order: require('../orders/order.model'),
    Bag: require('../bags/bag.model'),
    ShippingUser: require('../shippingUsers/shippingUser.model')
};