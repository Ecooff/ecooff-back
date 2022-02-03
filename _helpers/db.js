const config = require('config.json');
const mongoose = require('mongoose');
const connectionOptions = { useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false };
mongoose.connect("mongodb://localhost/ecooff" || config.connectionString, connectionOptions);
mongoose.Promise = global.Promise;

module.exports = {
    User: require('../users/user.model'),
    Category: require('../categories/category.model'),
    Provider: require('../providers/provider.model'),
    Product: require('../products/product.model'),
    Stock: require('../stock/stock.model')
};