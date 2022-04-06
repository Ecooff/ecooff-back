const db = require('_helpers/db');
const config = require('config.json');
const jwt = require('jsonwebtoken');
//const { ObjectId } = require('mongoose');
const ObjectId = require('mongodb').ObjectId;
const Cart = db.Cart;
const Stock = db.Stock;

module.exports = {
    addToCart,
    create,
    deleteItem,
    deleteCart,
    openCart,
    concat,
    getAll,
    getById    
};

async function create (userParam) {
    const cart = new Cart(userParam);

    await cart.save();
}

async function addToCart(token, userParam) {
    let userId = '';
    if (token) {
        
        jwt.verify(token, config.secret, (err, decoded) => {
            if (err){
                console.log(err.message);
                throw 'error';
            } else {
                userId = decoded.sub;
            }
        });
    }

    let productId = userParam.productId;
    let providerId = userParam.providerId;
    let quantity = userParam.quantity;
    let name = userParam.name;
    let price = userParam.price;
    let length = userParam.length;
    let lengthBool = '';
    if(length){
        lengthBool = (length.toLowerCase() === 'true');
    }

    try {
        let cart = await Cart.findOne({userId: userId});

        if (cart) {
            let itemIndex = cart.products.findIndex(p => p.productId == productId);

            if (itemIndex > -1) {

                let productItem = cart.products[itemIndex];
                productItem.quantity = quantity;
                cart.products[itemIndex] = productItem;

            } else {

                cart.products.push({ productId, providerId, quantity, name, price });

            }
            cart = await cart.save();


            if(lengthBool) {
                return { productLength : cart.products.length };
            } else {
                return cart;
            }
        
        } else {
            const newCart = await Cart.create({
                userId,
                products: [{ productId, providerId, quantity, name, price }]
              });

                if(lengthBool) {
                    return { productLength : newCart.products.length };
                } else {
                    return newCart;
                }        
        }
    } catch(err) {
        console.log(err);
    }
}

async function deleteItem(token, userParam) {
    let userId = '';
    if (token) {
        
        jwt.verify(token, config.secret, (err, decoded) => {
            if (err){
                console.log(err.message);
                throw 'error';
            } else {
                userId = decoded.sub;
            }
        });
    }

    let cart = await Cart.findOne({userId});

    console.log(userParam.id);

    cart.products.pull({ _id: userParam.id });

    await cart.save();

    return cart;
}

async function deleteCart(token) {
    let userId = '';
    if (token) {
        
        jwt.verify(token, config.secret, (err, decoded) => {
            if (err){
                console.log(err.message);
                throw 'error';
            } else {
                userId = decoded.sub;
            }
        });
    }

    await Cart.deleteOne({userId: userId});

    return;
}

async function openCart(token) {

    let userId = '';
    if (token) {
        
        jwt.verify(token, config.secret, (err, decoded) => {
            if (err){
                console.log(err.message);
                throw 'error';
            } else {
                userId = decoded.sub;
            }
        });
    }

    const cart = await Cart.findOne({ userId }, ['products', '-_id']);

    let products = cart.products;

    let finalArray = [];

    for(const product of products) {

        let concatArray = await concat(product)

        finalArray.push(concatArray)

    }

    return finalArray;
}

async function concat(product) {

    let fetchData = await Stock.findOne({ _id: ObjectId(product.productId) }, ['img', 'expDate', '-_id']);

    let concat = {img: fetchData.img, name: product.name, quantity: product.quantity, price: product.price, date: fetchData.expDate};

    return concat;

}

async function getAll() {
    return await Cart.find();
}

async function getById(id) {
    return await Cart.findById(ObjectId(id));
}