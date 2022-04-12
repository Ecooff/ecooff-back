const express = require('express');
const router = express.Router();
const stockService = require('./stock.service');

//routes
router.post('/create', create);
router.put('/updateStock', updateStock);
router.get('/', getAll);
router.get('/closeToExp', closeToExp);
router.get('/forYou', forYou);
router.get('/:id', getById);
router.get('/partialMatch/:search', partialMatch);
router.get('/getBySubcategory/:subcat', getBySubcategory);
router.get('/getByProvider/:provId', getByProvider);
router.get('/getByProvSubcat/:provId/:subcat', getByProvSubcat);
router.get('/getByCategory/:cat', getByCategory);

module.exports = router;

//functions

function create(req, res, next) {
    stockService.create(req.body)
        .then(stock => stock ? res.json(stock) : res.sendStatus(404))
        .catch(err => next(err));
}

function updateStock(req, res, next) {
    stockService.updateStock(req.body)
        .then(stock => stock ? res.json(stock) : res.sendStatus(404))
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

function partialMatch(req, res, next) {
    stockService.partialMatch(req.params.search)
        .then(stock => stock ? res.json(stock) : res.sendStatus(404))
        .catch(err => next(err));
}

function getBySubcategory(req, res, next) {
    stockService.getBySubcategory(req.params.subcat)
        .then(stock => stock ? res.json(stock) : res.status(404).json({ message: 'no existen productos en esa subcategoria' }))
        .catch(err => next(err));
}

function getByProvider(req, res, next) {
    stockService.getByProvider(req.params.provId)
        .then(stock => stock ? res.json(stock) : res.status(404).json({ message: 'no existen productos de ese proveedor' }))
        .catch(err => next(err));
}

function getByProvSubcat(req, res, next) {
    stockService.getByProvSubcat(req.params)
        .then(stock => stock ? res.json(stock) : res.status(404).json({ message: 'no existen productos en esa subcategoria de ese proveedor' }))
        .catch(err => next(err));
}

function getByCategory(req, res, next) {
    stockService.getByCategory(req.params.cat)
        .then(stock => stock ? res.json(stock) : res.status(404).json({ message: 'no existen productos en esa subcategoria' }))
        .catch(err => next(err));
}

function closeToExp(req, res, next) {
    stockService.closeToExp(req.body)
        .then(stock => stock ? res.json(stock) : res.status(404).json({ message: 'No hay productos cerca de su vencimiento' }))
        .catch(err => next(err));
}

function forYou(req, res, next) {
    stockService.forYou(req.headers.authorization.split(' ')[1])
        .then(stock => stock ? res.json(stock) : res.status(404).json({ message: 'Aún no tienes suficientes compras para que te recomendemos productos' }))
        .catch(err => next(err));
}