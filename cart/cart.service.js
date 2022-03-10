const db = require('_helpers/db');
const config = require('config.json');
const jwt = require('jsonwebtoken');
//const { ObjectId } = require('mongoose');
const ObjectId = require('mongodb').ObjectId;
const Cart = db.Cart;

module.exports = {
    addToCart,
    create,
    getAll,
    getById,
    deleteItem,
    deleteCart
};

async function create (userParam) {
    const cart = new Cart(userParam);

    await cart.save();
}

async function getAll() {
    return await Cart.find();
}

async function getById(id) {
    return await Cart.findById(ObjectId(id));
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

                cart.products.push({ productId, quantity, name, price });

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
                products: [{ productId, quantity, name, price }]
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