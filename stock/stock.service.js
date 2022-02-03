const db = require('_helpers/db');
const Stock = db.Stock;

module.exports = {
    create
};

async function create(userParam) {

    const stock = new Stock(userParam);

    await stock.save();
}