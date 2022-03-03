const express = require('express');
const router = express.Router();
const orderService = require('./order.service');

//routes
router.post('/create', create);
router.get('/', getAll);

module.exports = router;

function create(req, res, next) {
    orderService.create(req.headers.authorization.split(' ')[1])
        .then(order => order ? res.json(order) : res.status(404).json({ message: 'Hubo un problema al crear la orden de compra' }))
        .catch(err => next(err));
}

function getAll(req, res, next) {
    orderService.getAll()
        .then(order => res.json(order))
        .catch(err => next(err));
}