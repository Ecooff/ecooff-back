const db = require('_helpers/db');
const Stock = db.Stock;
const Product = db.Product;
const Provider = db.Provider;
const userService = require('../users/user.service');
const ObjectId = require('mongodb').ObjectId;

module.exports = {
    create,
    updateStock,
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

    const stock = new Stock;

    stock.expPrice = userParam.expPrice;
    stock.expDate = userParam.expDate;
    stock.stock = userParam.stock;

    let model = await Product.findOne({ _id: userParam.modelId });

    if (model) {

        stock.modelId = model._id;
        stock.name = model.name;
        stock.category = model.category;
        stock.subcategory = model.subcategory;
        stock.description = model.description;
        stock.listPrice = model.listPrice;
        stock.img = model.img;
        stock.waterSave = model.waterSave;
        stock.carbonFootprint = model.carbonFootprint;

    } else {

        throw 'no se encontro el modelo de producto';

    }

    
    let provider = await Provider.findOne({ _id: userParam.providerId})

    if (provider) {

        stock.providerId = provider._id;
        stock.providerName = provider.name;
        stock.providerImg = provider.img;

    } else {

        throw 'no existe un proveedor con ese ID';
    }


    await stock.save();

    return stock;
}

async function updateStock (userParam) {

    const stock = await Stock.findOne({ _id : userParam.id });

    stock.stock = userParam.newStock;

    await stock.save();
    return stock;

}

async function getAll() {
    return await Stock.find();
}

async function getById(id) {
    return await Stock.findById(ObjectId(id));
}

async function partialMatch(query) {

    //paso a paso:esta api es de busqueda parcial por nombre y acepta filtros fijarse aca los parametros que acepta la api. 
    //en la request, agregar los parametros a llamar desde query. 
    //name es obligatorio, el resto son opcionales.

    let params = {
        name: { "$regex" : query.name, "$options" : "i" }
    }
    
    if(query.category){
        params.category = { "$regex" : query.category, "$options" : "i" };
    }
    
    if(query.subcategory){
        params.subcategory = { "$regex" : query.subcategory, "$options" : "i" };
    }
    
    if(query.providerId){
        params.providerId = query.providerId;
    }

    return await Stock.find({
        $and: [params]
    }).sort({'expDate': -1})

}

async function getBySubcategory(subcat) {
    
    return await Stock.find({ subcategory : subcat });
}

async function getByProvider(prov) {
    return await Stock.find({ providerId : prov });
}

async function getByProvSubcat({provId, subcat}) {
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
                i == favs.length-1 ? resolve(listOfFavs) : null;
            })

        });
    })
               
}

