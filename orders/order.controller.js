const express = require('express');
const router = express.Router();
const orderService = require('./order.service');

//routes
router.post('/create', create);
router.get('/', getAll);
router.put('/changeStatus', changeStatus);
router.delete('/cancelOrder', cancelOrder);
router.get('/getByUserId', getByUserId);

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

function changeStatus(req, res, next) {
    orderService.changeStatus(req.body)
        .then(order => order ? res.json(order) : res.status(404).json({ message: 'No se pudo actualizar el estado' }))
        .catch(err => next(err));
}

function cancelOrder(req, res, next) {
    orderService.cancelOrder(req.body)
        .then(() => res.json({ message: 'Orden cancelada' }))
        .catch(next);
}

function getByUserId(req, res, next) {
    orderService.getByUserId(req.body)
        .then(orders => orders ? res.json(orders) : res.status(404).json({ message: 'No se pudo obtener las ordenes del usuario' }))
        .catch(err => next(err));
}