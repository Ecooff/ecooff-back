const db = require('_helpers/db');
const Stock = db.Stock;

module.exports = {
    create,
    getAll,
    getById,
    getBySubcategory
};

async function create(userParam) {

    const stock = new Stock(userParam);

    await stock.save();
}

async function getAll() {
    return await Stock.find();
}

async function getById(id) {
    return await Stock.findById(id);
}

async function getBySubcategory(subcat) {
    console.log('subcat');
    return 'falopa'; //await Stock.find({ subcategory : subcat });
}