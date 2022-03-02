const db = require('_helpers/db');
const config = require('config.json');
const jwt = require('jsonwebtoken');
const Cart = db.Cart;
const userService = require('../users/user.service');

module.exports = {
    addToCart,
    create,
    getAll
};

async function create (userParam) {
    const cart = new Cart(userParam);

    await cart.save();
}

async function getAll() {
    return await Cart.find();
}

async function addToCart(token, userParam) {
    let userId = '620bfd7fbc61ae200885dfc1';
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
    let lengthBool = (length.toLowerCase() === 'true');

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

//return { productLength : cart.products.length };