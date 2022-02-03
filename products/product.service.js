const db = require('_helpers/db');
const Product = db.Product;

module.exports = {
    create
};

async function create(userParam) {
    if (await Product.findOne({ title: userParam.title })) {
        throw 'Ese producto ya existe';
    }

    const product = new Product(userParam);

    await product.save();
}