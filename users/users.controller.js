const express = require('express');
const { serverAlive } = require('./user.service');
const router = express.Router();
const userService = require('./user.service');

// routes
router.get('/serverAlive', (req, res) => {
    res.send("Hello World");
});
router.get('/serverAlive2', (req, res) => {
    res.send("Hello World");
});
router.post('/authenticate', authenticate);
router.post('/register', register);
router.get('/', getAll);
//router.get('/current', getCurrent);
router.get('/:id', getById);
router.post('/resendVerify', resendVerify);
router.post('/verifyEmail', verifyEmail);
router.post('/forgotPasswordRequest', forgotPasswordRequest);
router.put('/forgotPasswordUpdate', forgotPasswordUpdate);
/*router.put('/:id', update);
router.delete('/:id', _delete);*/

module.exports = router;

function authenticate(req, res, next) {
    userService.authenticate(req.body)
        .then(user => user ? res.json(user) : res.status(400).json({ message: 'El usuario o la contraseña son incorrectos' }))
        .catch(err => next(err));
}

function register(req, res, next) {
    userService.create(req.body)
        .then(() => res.json({}))
        .catch(err => next(err));
}

function getAll(req, res, next) {
    userService.getAll()
        .then(users => res.json(users))
        .catch(err => next(err));
}

/*function getCurrent(req, res, next) {
    userService.getById(req.user.sub)
        .then(user => user ? res.json(user) : res.sendStatus(404))
        .catch(err => next(err));
}*/

function getById(req, res, next) {
    userService.getById(req.params.id)
        .then(user => user ? res.json(user) : res.sendStatus(404))
        .catch(err => next(err));
}

function resendVerify(req, res, next) {
    userService.resendVerify(req.body)
    .then(() => res.json({ message: 'Codigo de verificacion reenviado'}))
    .catch(next);
}

function verifyEmail(req, res, next) {
    userService.verifyEmail(req.body)
        .then(() => res.json({ message: 'verificado!' }))
        .catch(next);
}

function forgotPasswordRequest(req, res, next) {
    userService.forgotPasswordRequest(req.body)
    .then(() => res.json({ message: 'Token enviado por email' }))
    .catch(next);
}

function forgotPasswordUpdate(req, res, next) {
    userService.forgotPasswordUpdate(req.body)
    .then(() => res.json({ message: 'Clave actualizada'}))
    .catch(next);
}

/*function update(req, res, next) {
    userService.update(req.params.id, req.body)
        .then(() => res.json({}))
        .catch(err => next(err));
}

function _delete(req, res, next) {
    userService.delete(req.params.id)
        .then(() => res.json({}))
        .catch(err => next(err));
}*/