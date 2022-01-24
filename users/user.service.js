const config = require('config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require("crypto");
const db = require('_helpers/db');
const res = require('express/lib/response');
const sendEmail = require('../_helpers/send-email');
const User = db.User;

module.exports = {
    authenticate,
    getAll,
    getById,
    create,
    verifyEmail
    // update,
    // delete: _delete
};

async function authenticate({ username, password }) {
    const user = await User.findOne({ username });
    // if (!user.confirmed) {
    //     throw new Error('Por favor, confirma tu email para iniciar sesion');
    // }
    if (user && bcrypt.compareSync(password, user.hash)) {
        const token = jwt.sign({ sub: user.id }, config.secret, { expiresIn: '90d' });//refresh token cada vez q cambie de vista
        return {
            ...user.toJSON(),
            token
        };
    }
}

async function getAll() {
    return await User.find();
}

async function getById(id) {
    return await User.findById(id);
}

function randomTokenString() {
    return crypto.randomBytes(40).toString('hex');
}

async function create(userParam) {
    // validate
    if (await User.findOne({ username: userParam.username })) {
        throw 'Ese nombre de usuario ya existe, prueba con otro';
    }

    if (await User.findOne({ email: userParam.email })) {
        throw 'Ese email ya esta en uso, prueba con otro';
    }

    const user = new User(userParam);

    // hash password
    if (userParam.password) {
        user.hash = bcrypt.hashSync(userParam.password, 10);
    }

    user.verificationToken = randomTokenString();

    // save user
    await user.save();

    await sendEmail({
        to: user.email,
        subject: 'Verificar Email Ecooff',
        html: `<p>token: ${user.verificationToken}</p>`
    })
}

async function verifyEmail({ token }) {
    console.log(token);
    const user = await db.User.findOne({ verificationToken: token });

    console.log(user);

    if (!user) throw 'Verification failed';

    user.verified = true;
    user.verificationToken = undefined;
    await user.save();
}

/*async function update(id, userParam) {
    const user = await User.findById(id);

    // validate
    if (!user) throw 'Usuario no encontrado';
    if (user.username !== userParam.username && await User.findOne({ username: userParam.username })) {
        throw 'El usuario "' + userParam.username + '" ya existe, prueba con otro';
    }

    // hash password if it was entered
    if (userParam.password) {
        userParam.hash = bcrypt.hashSync(userParam.password, 10);
    }

    // copy userParam properties to user
    Object.assign(user, userParam);

    await user.save();
}

async function _delete(id) {
    await User.findByIdAndRemove(id);
}*/