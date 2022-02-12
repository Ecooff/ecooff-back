const express = require('express');
const router = express.Router();
const stockService = require('./stock.service');

//routes
router.post('/create', create);
router.get('/', getAll);
router.get('/:id', getById);
router.get('/getBySubcategory', getBySubcategory);

module.exports = router;

//functions

function create(req, res, next) {
    stockService.create(req.body)
        .then(() => res.json({}))
        .catch(err => next(err));
}

function getAll(req, res, next) {
    stockService.getAll()
        .then(stock => res.json(stock))
        .catch(err => next(err));
}

function getById(req, res, next) {
    stockService.getById(req.params.id)
        .then(stock => stock ? res.json(stock) : res.sendStatus(404))
        .catch(err => next(err));
}

function getBySubcategory(req, res, next) {
    console.log(req.params.subcat);
    stockService.getBySubcategory(req.params.subcat)
        .then(stock => res.json({stock}))
        .catch(err => next(err));
}