const db = require('_helpers/db');
const Stock = db.Stock;
const User = db.User;
const userService = require('../users/user.service');
const ObjectId = require('mongodb').ObjectId;

module.exports = {
    create,
    getAll,
    getById,
    partialMatch,
    getBySubcategory,
    getByProvider,
    getByProvSubcat,
    getByCategory,
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

async function getById(id) {
    return await Stock.findById(ObjectId(id));
}

async function partialMatch(search) {
    return await Stock.find({ title: {"$regex" : search, "$options" : "i"}})
}

async function getBySubcategory(subcat) {
    
    return await Stock.find({ subcategory : subcat });
}

async function getByProvider(prov) {
    return await Stock.find({ providerId : prov });
}

async function getByProvSubcat({provId, subcat}) {
    console.log(provId);

    return await Stock.find({providerId : provId, subcategory: subcat});
}

async function getByCategory(cat) {
    return await Stock.find({ category : cat });
}

async function closeToExp(){
    return await Stock.find({expDate : { $lte : Date.now() + 14*24*60*60*1000}});
}

async function forYou(req){  //emprolijar con casos puntuales
    const user = await userService.retrieveUser(req);
    const favs = user.favorites;
    let favItems = [];
    let listOfFavs = [];
    favs.sort((a, b) => {
        return b.count - a.count;
    });

    return new Promise(function(resolve, reject) {
        favs.forEach((item, i) => {
            favItems = getBySubcategory(item.subcategoryId).then(function(result) {
                result.forEach( item2 => {
                    listOfFavs.push(item2);
                })
                console.log(listOfFavs)
                i == favs.length-1 ? resolve(listOfFavs) : null;
            })

        });
    })
               
}

