const db = require('_helpers/db');
const Product = db.Product;
const Category = db.Category;

module.exports = {
    create,
    getAll,
    getById
};

async function create(userParam) {

    if (await Product.findOne({ name: userParam.name })) {
        throw 'Ese producto ya existe';
    }

    let category = await Category.findOne({ 'subcategories._id': userParam.subcatId })

    if (category) {

        const product = new Product;

        product.name = userParam.name;
        product.description = userParam.description;
        product.listPrice = userParam.listPrice;
        product.img = userParam.img;
        product.allergenics = userParam.allergenics;

        product.category = category.category

        let subcategories = category.subcategories;

        for (const subcategory of subcategories) {

            if (subcategory._id == userParam.subcatId) product.subcategory = subcategory.subcategory;

        }

        await product.save();
        return product;

    } else {

        throw 'no existe una subcategoria con ese ID';

    }
}

async function getAll() {
    return await Product.find();
}

async function getById(id) {
    return await Product.findById(id);
}