const express = require('express');
const router = express.Router();
const cartService = require('./cart.service');

//routes
router.post('/create', create);
router.post('/addToCart', addToCart);
router.put('/deleteItem/:id', deleteItem);
router.delete('/deleteCart', deleteCart);
router.get('/openCart', openCart);
router.post('/confirmCart', confirmCart);
router.get('/cartLength', cartLength);
router.get('/productLength/:productId', productLength);
router.get('/', getAll);
router.get('/:id', getById);

module.exports = router;

function create(req, res, next) {
    cartService.create(req.body)
        .then(() => res.json({}))
        .catch(err => next(err));
}

function addToCart(req, res, next) {
    cartService.addToCart(req.headers.authorization.split(' ')[1], req.body)
        .then(cart => cart ? res.json(cart) : res.status(404).json({ message: 'Hubo un problema al buscar el carrito' }))
        .catch(err => next(err));
}

function deleteItem(req, res, next) {
    cartService.deleteItem(req.headers.authorization.split(' ')[1], req.params.id)
        .then(cart => cart ? res.json(cart) : res.status(404).json({ message: 'Hubo un problema al eliminar el producto' }))
        .catch(err => next(err));
}

function deleteCart(req, res, next) {
    cartService.deleteCart(req.headers.authorization.split(' ')[1])
        .then(() => res.json({}))
        .catch(err => next(err));
}

function openCart(req, res, next) {
    cartService.openCart(req.headers.authorization.split(' ')[1])
        .then(cart => cart ? res.json(cart) : res.status(404).json({ message: 'No se pudo recuperar el carrito' }))
        .catch(err => next(err));
}

function confirmCart(req, res, next) {
    cartService.confirmCart(req.headers.authorization.split(' ')[1], req.body)
        .then(cart => cart ? res.json(cart) : res.status(404).json({ message: 'No se pudo recuperar el carrito' }))
        .catch(err => next(err));
}

function cartLength(req, res, next) {
    cartService.cartLength(req.headers.authorization.split(' ')[1])
        .then(cart => cart ? res.json(cart) : res.status(404).json({ message: 'No se pudo recuperar el carrito' }))
        .catch(err => next(err));
}

function productLength(req, res, next) {
    cartService.productLength(req.headers.authorization.split(' ')[1], req.params.productId)
        .then(cart => cart ? res.json(cart) : res.status(404).json({ message: 'No se pudo recuperar el carrito' }))
        .catch(err => next(err));
}

function getAll(req, res, next) {
    cartService.getAll()
        .then(cart => res.json(cart))
        .catch(err => next(err));
}

function getById(req, res, next) {
    cartService.getById(req.params.id)
        .then(cart => cart ? res.json(cart) : res.sendStatus(404))
        .catch(err => next(err));
}