const express = require('express');
const router = express.Router();
const productService = require('./product.service');

//routes
router.post('/create', create);
router.get('/', getAll);
router.get('/:id', getById);

module.exports = router;

//functions

function create(req, res, next) {
    productService.create(req.body)
        .then(product => product ? res.json(product) : res.sendStatus(404))
        .catch(err => next(err));
}

function getAll(req, res, next) {
    productService.getAll()
        .then(product => res.json(product))
        .catch(err => next(err));
}

function getById(req, res, next) {
    productService.getById(req.params.id)
        .then(product => product ? res.json(product) : res.sendStatus(404))
        .catch(err => next(err));
}