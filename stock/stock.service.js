const db = require('_helpers/db');
const Stock = db.Stock;
const User = db.User;

module.exports = {
    create,
    getAll,
    getBySubcategory,
    getByProvider,
    getByProvSubcat,
    closeToExp,
    forYou
};

async function create(userParam) {

    const stock = new Stock(userParam);

    await stock.save();
}

async function getAll() {
    return await Stock.find();
}

async function getBySubcategory(subcat) {
    return await Stock.find({ subcategory : subcat });
}

async function getByProvider(prov) {
    return await Stock.find({ providerName : prov });
}

async function getByProvSubcat({prov, subcat}) {
    return await Stock.find({providerName : prov, subcategory: subcat});
}

async function closeToExp(){
    return await Stock.find({expDate : { $lte : Date.now() + 14*24*60*60*1000}});
}

async function forYou(jwtParam){  //a completar
    const user = await User.findOne({ jwt : jwtParam});
    console.log(user);

    return; //await Stock.find({ subcategory : user.favorites.subcategoryId });
}

