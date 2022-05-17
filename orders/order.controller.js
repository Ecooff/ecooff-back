const express = require('express');
const router = express.Router();
const orderService = require('./order.service');

//routes
router.post('/create', create);
router.get('/openOrder/:id', openOrder);
router.get('/listOfOrders', listOfOrders);
router.get('/inProgress', inProgress);
router.get('/', getAll);
router.put('/changeStatus', changeStatus);
router.delete('/cancelOrder', cancelOrder);
router.get('/:id', getById);

module.exports = router;

function create(req, res, next) {
    orderService.create(req.headers.authorization.split(' ')[1], req.body)
        .then(order => order ? res.json(order) : res.status(404).json({ message: 'Hubo un problema al crear la orden de compra' }))
        .catch(err => next(err));
}

function openOrder(req, res, next) {
    orderService.openOrder(req.params.id)
        .then(order => order ? res.json(order) : res.status(404).json({ message: 'Hubo un problema al visualizar la orden' }))
        .catch(err => next(err));
}

function listOfOrders(req, res, next) {
    orderService.listOfOrders(req.headers.authorization.split(' ')[1])
        .then(orders => orders ? res.json(orders) : res.status(404).json({ message: 'No se pudo obtener las ordenes del usuario' }))
        .catch(err => next(err));
}

function getAll(req, res, next) {
    orderService.getAll()
        .then(order => res.json(order))
        .catch(err => next(err));
}

function getById(req, res, next) {
    orderService.getById(req.params.id)
        .then(order => order ? res.json(order) : res.sendStatus(404))
        .catch(err => next(err));
}

function inProgress(req, res, next) {
    orderService.inProgress()
        .then(orders => res.json(orders))
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