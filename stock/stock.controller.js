const express = require('express');
const router = express.Router();
const stockService = require('./stock.service');

//routes
router.post('/create', create);
router.get('/', getAll);
router.get('/getBySubcategory', getBySubcategory);
router.get('/getByProvider', getByProvider);
router.get('/getByProvSubcat', getByProvSubcat);
router.get('/closeToExp', closeToExp);
router.get('/forYou', forYou);

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

function getBySubcategory(req, res, next) {
    stockService.getBySubcategory(req.body.subcat)
        .then(stock => stock ? res.json(stock) : res.status(404).json({ message: 'no existen productos en esa subcategoria' }))
        .catch(err => next(err));
}

function getByProvider(req, res, next) {
    stockService.getByProvider(req.body.prov)
        .then(stock => stock ? res.json(stock) : res.status(404).json({ message: 'no existen productos de ese proveedor' }))
        .catch(err => next(err));
}

function getByProvSubcat(req, res, next) {
    stockService.getByProvSubcat(req.body)
        .then(stock => stock ? res.json(stock) : res.status(404).json({ message: 'no existen productos en esa subcategoria de ese proveedor' }))
        .catch(err => next(err));
}

function closeToExp(req, res, next) {
    stockService.closeToExp(req.body)
        .then(stock => stock ? res.json(stock) : res.status(404).json({ message: 'No hay productos cerca de su vencimiento' }))
        .catch(err => next(err));
}

function forYou(req, res, next) {  //a completar
    stockService.forYou(req.headers.authorization.split(' ')[1])
        .then(stock => stock ? res.json(stock) : res.status(404).json({ message: 'Aún no tienes suficientes compras para que te recomendemos productos' }))
        .catch(err => next(err));
}