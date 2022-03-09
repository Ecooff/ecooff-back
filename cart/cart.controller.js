const express = require('express');
const router = express.Router();
const cartService = require('./cart.service');

//routes
router.post('/create', create);
router.post('/addToCart', addToCart);
router.get('/', getAll);
router.put('/deleteItem', deleteItem);
router.delete('/deleteCart', deleteCart);

module.exports = router;

function create(req, res, next) {
    cartService.create(req.body)
        .then(() => res.json({}))
        .catch(err => next(err));
}

function getAll(req, res, next) {
    cartService.getAll()
        .then(cart => res.json(cart))
        .catch(err => next(err));
}

function addToCart(req, res, next) {
    cartService.addToCart(req.headers.authorization.split(' ')[1], req.body)
        .then(cart => cart ? res.json(cart) : res.status(404).json({ message: 'Hubo un problema al buscar el carrito' }))
        .catch(err => next(err));
}

function deleteItem(req, res, next) {
    cartService.deleteItem(req.headers.authorization.split(' ')[1], req.body)
        .then(cart => cart ? res.json(cart) : res.status(404).json({ message: 'Hubo un problema al eliminar el producto' }))
        .catch(err => next(err));
}

function deleteCart(req, res, next) {
    cartService.deleteCart(req.headers.authorization.split(' ')[1])
        .then(() => res.json({}))
        .catch(err => next(err));
}