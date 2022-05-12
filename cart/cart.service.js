const db = require('_helpers/db');
const config = require('config.json');
const jwt = require('jsonwebtoken');
const ObjectId = require('mongodb').ObjectId;
const Cart = db.Cart;
const Stock = db.Stock;

module.exports = {
    addToCart,
    create,
    deleteItem,
    deleteCart,
    openCart,
    cartLength,
    productLength,
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
    let quantity = userParam.quantity;
    let providerId = '';
    let name = '';
    let price = Number;
    
    let stock = await Stock.findOne({ _id: productId});

    if(stock) {

        providerId = stock.providerId;
        name = stock.title;
        price = stock.expPrice;

    } else {

        throw 'El producto seleccionado no existe';

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


            return cart;
        
        } else {
            const newCart = await Cart.create({
                userId,
                products: [{ productId, providerId, quantity, name, price }]
            });

            return newCart;      
        }
    } catch(err) {
        console.log(err);
    }
}

async function deleteItem(token, id) {
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

    cart.products.pull({ _id : ObjectId(id) });

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

    let productArray = [];

    for (const product of products) {

        let stock = await Stock.findOne({ _id : product.productId });

        productArray.push({ 

            cartId: product._id,
            id: product.productId,
            name: stock.name,
            price: stock.expPrice,
            img: stock.img,
            quantity: product.quantity,
            expirationDate: stock.expDate

        });

    }

    return productArray;

}

async function cartLength(token) {

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

    return {cartLength : products.length};

}

async function productLength(token, productId) {

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

    for (const product of products) {

        if (product.productId == productId) return { productLength : product.quantity };

    }

    return { productLength : 0 };

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