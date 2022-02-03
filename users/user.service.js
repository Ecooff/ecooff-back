const config = require('config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require("crypto");
const db = require('_helpers/db');
const res = require('express/lib/response');
const User = db.User;
const sendEmail = require('_helpers/send-email');

module.exports = {
    authenticate,
    getAll,
    getById,
    create,
    resendVerify,
    verifyEmail,
    forgotPasswordRequest,
    forgotPasswordTokenOnly,
    forgotPasswordUpdate
};

//LOGIN

async function authenticate({ email, password }) {
    const user = await User.findOne({ email });

    if (user && bcrypt.compareSync(password, user.hash)) {

        if (!user.verified) {
            return 'por favor validar cuenta';
        }   

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

//GENERATE TOKENS (not authentication tokens, verify email and forgot pw tokens)
function randomTokenString() {
    return crypto.randomBytes(3).toString('hex');
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

    await sendEmail({
        to: user.email,
        subject: 'token de validacion',
        html: `<p>utiliza este token para validar tu cuenta: ${user.verificationToken}</p>`
    });

    await user.save();
}

//VERIFY EMAIL, RESEND VERIFY

async function resendVerify({ emailParam }) {
    const user = await db.User.findOne({ email : emailParam });

    if (!user) throw 'Usuario no encontrado';
    if(user.verified) throw 'El usuario indicado ya fue validado';

    user.verificationToken = randomTokenString();

    
    await sendEmail({
        to: user.email,
        subject: 'token de validacion (reenvio)',
        html: `<p>utiliza este token para validar tu cuenta: ${user.verificationToken}</p>`
    });

    await user.save();
}

async function verifyEmail({ token }) {
    console.log(token);
    const user = await db.User.findOne({ verificationToken: token });

    console.log(user);

    if (!user) throw 'Usuario no encontrado/token invalido';

    user.verified = true;
    user.verificationToken = undefined;
    await user.save();
}

//FORGOT PW

async function forgotPasswordRequest({ email }) {
    const user = await db.User.findOne({email : email});
    if(!user) throw 'usuario no encontrado';

    user.forgotPwToken = randomTokenString();

    await sendEmail({
        to: user.email,
        subject: 'olvide mi contraseña',
        html: `<p>utiliza este token reestablecer tu contraseña: ${user.forgotPwToken}</p>`
    });    

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
}