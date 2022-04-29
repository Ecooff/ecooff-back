﻿const config = require('config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require("crypto");
const db = require('_helpers/db');
const User = db.User;
const sendEmail = require('_helpers/send-email');
const ObjectId = require('mongodb').ObjectId;

module.exports = {
    authenticate,
    retrieveUser,
    addAddress,
    changeDefaultAddress,
    getUserAddresses,
    deleteAddress,
    getAll,
    getById,
    create,
    resendVerify,
    verifyEmail,
    forgotPasswordRequest,
    forgotPasswordTokenOnly,
    forgotPasswordUpdate,
    editEmail,
    editName
};

//LOGIN



async function authenticate({ email, password }) {
    const user = await User.findOne({ email });

    if (user && bcrypt.compareSync(password, user.hash)) {

        if (!user.verified) {
            return {verified: user.verified};
        }   

        const token = jwt.sign({ sub: user.id }, config.secret, { expiresIn: '30d' });
        return {
            ...user.toJSON(),
            token
        };
    }
}

async function retrieveUser(token) {
    let id = '';
    let user = '';
    if (token) {
        
        jwt.verify(token, config.secret, (err, decoded) => {
            if (err){
                console.log(err.message);
                throw 'error';
            } else {
                id = decoded.sub;
            }
        });
        user = await User.findOne({ _id : ObjectId(id) });

        const newToken = jwt.sign({ sub: user.id }, config.secret, { expiresIn: '30d' });
        return {
            ...user.toJSON(),
            newToken
        };
    } else {
        throw 'Token invalido';
    }
}

//ADDRESSES

async function addAddress(token, userParam) {

    let id = '';
    let user = '';

    if (token) {
        
        jwt.verify(token, config.secret, (err, decoded) => {
            if (err){
                console.log(err.message);
                throw 'error';
            } else {
                id = decoded.sub;
            }
        });
    }

    user = await User.findOne({ _id : ObjectId(id) });
    
    let defaultAddress = false;
    let street = '';
    let streetNumber = Number;
    let floor = Number;
    let door = '';
    let CP = Number;

    console.log('here');

    if (user.addresses.length > 0) {

        street = userParam.street;
        streetNumber = userParam.streetNumber;
        floor = userParam.floor;
        door = userParam.door;
        CP = userParam.CP;

        user.addresses.push( { street, streetNumber, floor, door, CP });

    } else {

        defaultAddress = true;
        street = userParam.street;
        streetNumber = userParam.streetNumber;
        floor = userParam.floor;
        door = userParam.door;
        CP = userParam.CP;

        user.addresses.push( { defaultAddress, street, streetNumber, floor, door, CP });

    }

    await user.save();

    const address = user.addresses[user.addresses.length - 1];

    return address;

}

async function changeDefaultAddress(token, id) {

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

    await User.updateOne({ _id : userId, 'addresses.defaultAddress': 'true'}, { '$set': {
        'addresses.$.defaultAddress': 'false'
    }});

    await User.updateOne({ 'addresses._id' : id  }, { '$set' : {
        'addresses.$.defaultAddress': 'true',
    }});

    const user = await User.find({ _id : userId });

    return user;
}

async function getUserAddresses(token) {

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

    const addresses = await User.find({ _id : ObjectId(userId) }, ['addresses', '-_id']);

    if (addresses) {

        return addresses;

    }

}

async function deleteAddress(token, id) {

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

    const user = await User.findOne({ _id : userId });

    user.addresses.pull(id);

    await user.save();

    return user.addresses;

}

//GET ALL / GET BY ID

async function getAll() {
    return await User.find();
}

async function getById(id) {
    return await User.findById(ObjectId(id));
}

//GENERATE TOKENS (not authentication tokens, verify email and forgot pw tokens)
function randomTokenString() {
    return crypto.randomBytes(2).toString('hex');
}

//REGISTER
async function create(userParam) {

    if (await User.findOne({ email: userParam.email })) {
        throw 'Ese email ya esta en uso, prueba con otro';
    }

    const user = new User(userParam);

    if (userParam.password) {
        user.hash = bcrypt.hashSync(userParam.password, 10);
    }

    user.verificationToken = randomTokenString();

    // await sendEmail({
    //     to: user.email,
    //     subject: 'token de validacion',
    //     html: `<p>utiliza este token para validar tu cuenta: ${user.verificationToken}</p>`
    // });

    await user.save();
    return {...user.toJSON()};
}

//VERIFY EMAIL, RESEND VERIFY

async function resendVerify({ emailParam }) {
    const user = await db.User.findOne({ email : emailParam });

    if (!user) throw 'Usuario no encontrado';
    if(user.verified) throw 'El usuario indicado ya fue validado';

    user.verificationToken = randomTokenString();

    
    // await sendEmail({
    //     to: user.email,
    //     subject: 'token de validacion (reenvio)',
    //     html: `<p>utiliza este token para validar tu cuenta: ${user.verificationToken}</p>`
    // });

    await user.save();
}

async function verifyEmail({ token }) {
    const user = await db.User.findOne({ verificationToken: token }, ['-favorites', '-addresses']);

    if (!user) throw 'Usuario no encontrado/token invalido';

    user.verified = true;
    user.verificationToken = undefined;

    await user.save();

    const newToken = jwt.sign({ sub: user.id }, config.secret, { expiresIn: '30d' });
        return {
            ...user.toJSON(),
            newToken
        };


    //return {...user.toJSON()};
    
}

//FORGOT PW

async function forgotPasswordRequest({ email }) {
    const user = await db.User.findOne({email : email});
    if(!user) throw 'usuario no encontrado';

    user.forgotPwToken = randomTokenString();

    // await sendEmail({
    //     to: user.email,
    //     subject: 'olvide mi contraseña',
    //     html: `<p>utiliza este token reestablecer tu contraseña: ${user.forgotPwToken}</p>`
    // });    

    await user.save();
}

async function forgotPasswordTokenOnly(userParam) {
    const user = await db.User.findOne({ forgotPwToken: userParam.token });
    if (!user) throw 'Usuario no encontrado/token invalido';
    
    return;
}

async function forgotPasswordUpdate(userParam) {
    const user = await db.User.findOne({ forgotPwToken: userParam.token });

    if (!user) throw 'Usuario no encontrado/token invalido';

    if(userParam.pw != userParam.confirmPw) throw 'las contraseñas deben coincidir'

    if (userParam.pw) {
        user.hash = bcrypt.hashSync(userParam.pw, 10);
    }
    user.forgotPwToken = undefined;

    await user.save();

    return {user : user};
}

async function editEmail(userParam) {
    const user = await User.findOne({email : userParam.oldEmail});

    if (!user) {
        throw 'Usuario no encontrado';
    }

    if (user && bcrypt.compareSync(userParam.password, user.hash)) {

        const emailInUse = await User.findOne({email : userParam.newEmail});

        if(emailInUse) {
            throw 'El nuevo email ya esta en uso';
        }

        user.email = userParam.newEmail;

        await user.save();

        return user;
    }
}

async function editName(userParam) {
    const user = await User.findOne({email : userParam.email});

    if (!user) {
        throw 'Usuario no encontrado';
    }

    if (user && bcrypt.compareSync(userParam.password, user.hash)) {

        user.firstName = userParam.firstName;
        user.lastName = userParam.lastName;

        await user.save();

        return user;
    } else {
        throw 'contraseña invalida';
    }
}