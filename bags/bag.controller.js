const express = require('express');
const router = express.Router();
const bagService = require('./bag.service');

//routes
router.post('/create', create);
router.get('/', getAll);

module.exports = router;

function create(req, res, next) {
    bagService.create(req.body)
        .then(bag => bag ? res.json(bag) : res.status(404).json({ message: 'Hubo un problema al crear la orden de compra' }))
        .catch(err => next(err));
}

function getAll(req, res, next) {
    bagService.getAll()
        .then(bags => res.json(bags))
        .catch(err => next(err));
}