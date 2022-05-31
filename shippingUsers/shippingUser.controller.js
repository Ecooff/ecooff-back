const express = require('express');
const router = express.Router();
const shippingUserService = require('./shippingUser.service');

// routes
router.post('/authenticate', authenticate);
router.get('/retrieveUser', retrieveUser);
router.post('/register', register);
router.get('/', getAll);
router.get('/:id', getById);

module.exports = router;

function authenticate(req, res, next) {
    shippingUserService.authenticate(req.body)
        .then(shippingUser => shippingUser ? res.json(shippingUser) : res.status(400).json({ message: 'El usuario o la contraseña son incorrectos' }))
        .catch(err => next(err));
}

function retrieveUser (req, res, next) {
    shippingUserService.retrieveUser(req.headers.authorization.split(' ')[1])
        .then(shippingUser => shippingUser ? res.json(shippingUser) : res.status(400).json({ message: 'no se pudo recuperar la sesion' }))
        .catch(err => next(err));
}

function register(req, res, next) {
    shippingUserService.register(req.body)
        .then(shippingUser => shippingUser ? res.json(shippingUser) : res.status(400).json({ message: 'ese email ya esta en uso, prueba con otro' }))
        .catch(err => next(err));
}

function getAll(req, res, next) {
    shippingUserService.getAll()
        .then(shippingUsers => res.json(shippingUsers))
        .catch(err => next(err));
}

function getById(req, res, next) {
    shippingUserService.getById(req.params.id)
        .then(shippingUser => shippingUser ? res.json(shippingUser) : res.sendStatus(404))
        .catch(err => next(err));
}