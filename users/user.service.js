const express = require('express');
const config = require('config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require("crypto");
const db = require('_helpers/db');
//const res = require('express/lib/response');
const User = db.User;
const sendEmail = require('_helpers/send-email');
const res = require('express/lib/response');
const { getMaxListeners } = require('process');
const ObjectId = require('mongodb').ObjectId;

module.exports = {
    authenticate,
    retrieveUser,
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

        const token = jwt.sign({ sub: user.id }, config.secret, { expiresIn: '90d' });
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
    }
    return user;
}



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
    const user = await db.User.findOne({ verificationToken: token });

    if (!user) throw 'Usuario no encontrado/token invalido';

    user.verified = true;
    user.verificationToken = undefined;

    await user.save();
    return {...user.toJSON()};
    
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
    }
}

