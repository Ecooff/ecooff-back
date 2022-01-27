const config = require('config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require("crypto");
const db = require('_helpers/db');
const res = require('express/lib/response');
const User = db.User;
const nodemailer = require('nodemailer');

module.exports = {
    authenticate,
    getAll,
    getById,
    create,
    resendVerify,
    verifyEmail,
    forgotPasswordRequest,
    forgotPasswordUpdate
};

//Send email
const transporter = nodemailer.createTransport( {
    service:"hotmail",
    auth: {
        user: "nodeseba@outlook.com",
        pass: "node1234",
    }
});

async function authenticate({ email, password }) {
    const user = await User.findOne({ email });

    if (user && bcrypt.compareSync(password, user.hash)) {

        if (!user.verified) {
            throw new Error('Por favor, confirma tu email para iniciar sesion');
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

    
    const options = {
        from: "nodeseba@outlook.com",
        to: user.email,
        subject:"Verificar Email",
        html:`
        <p>Gracias por registrarse. Este es el codigo para validar la cuenta: </p>
        <a href ="">${user.verificationToken}</a>
        `
    };
    
    transporter.sendMail(options, function(err, info) {
        if(err){
            console.log(err);
            return;
        }
        console.log("Email sent: " + info.response);
    });

    await user.save();
}

//VERIFY EMAIL, RESEND VERIFY

async function resendVerify({ emailParam }) {
    const user = await db.User.findOne({ email : emailParam });

    if (!user) throw 'Usuario no encontrado';
    if(user.verified) throw 'El usuario indicado ya fue validado';

    user.verificationToken = randomTokenString();

    
    const options = {
        from: "nodeseba@outlook.com",
        to: user.email,
        subject:"Verificar Email (Reenviado)",
        html:`
        <p>El codigo de verificacion de su cuenta ha sido actualizado: </p>
        <a href ="">${user.verificationToken}</a>
        `
    };
    
    transporter.sendMail(options, function(err, info) {
        if(err){
            console.log(err);
            return;
        }
        console.log("Email sent: " + info.response);
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

    const options = {
        from: "nodeseba@outlook.com",
        to: user.email,
        subject:"Olvide mi clave",
        html:`
        <p>Codigo para cambiar contraseña: </p>
        <a href ="">${user.forgotPwToken}</a>
        `
    };
    
    transporter.sendMail(options, function(err, info) {
        if(err){
            console.log(err);
            return;
        }
        console.log("Email sent: " + info.response);
    });    

    await user.save();
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