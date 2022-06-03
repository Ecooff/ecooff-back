const secret = process.env.SECRET_KEY;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require("crypto");
const db = require('_helpers/db');
const ShippingUser = db.ShippingUser;
const sendEmail = require('_helpers/send-email');
const ObjectId = require('mongodb').ObjectId;

module.exports = {
    authenticate,
    retrieveUser,
    register,
    getAll,
    getById
};

async function authenticate({ email, password }) {
    const shippingUser = await ShippingUser.findOne({ email });

    if (shippingUser && bcrypt.compareSync(password, shippingUser.hash)) {  

        const token = jwt.sign({ sub: shippingUser.id }, secret, { expiresIn: '30d' });
        return {
            ...shippingUser.toJSON(),
            token
        };
    } else {

        throw 'Usuario o contraseña incorrectos'

    }
}

async function retrieveUser(token) {
    let id = '';
    let shippingUser = '';
    if (token) {
        
        jwt.verify(token, secret, (err, decoded) => {
            if (err){
                console.log(err.message);
                throw 'error';
            } else {
                id = decoded.sub;
            }
        });
        shippingUser = await ShippingUser.findOne({ _id : ObjectId(id) });

        const newToken = jwt.sign({ sub: shippingUser.id }, secret, { expiresIn: '30d' });
        return {
            ...shippingUser.toJSON(),
            token : newToken,
            newToken
        };
    } else {
        throw 'Token invalido';
    }
}

async function register(userParam) {

    if (await ShippingUser.findOne({ email: userParam.email })) {
        throw 'Ese email ya esta en uso, prueba con otro';
    }

    const shippingUser = new ShippingUser(userParam);

    if (userParam.password) {

        shippingUser.hash = bcrypt.hashSync(userParam.password, 10);

    } else {

        throw 'por favor ingrese una contraseña';

    }

    await shippingUser.save();
    return {...shippingUser.toJSON()};
}

async function getAll() {
    return await ShippingUser.find();
}

async function getById(id) {
    return await ShippingUser.findById(ObjectId(id));
}