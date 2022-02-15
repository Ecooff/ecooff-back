const express = require('express');
const router = express.Router();
const providerService = require('./provider.service');

//routes
router.post('/create', create);
router.get('/', getAll);
router.get('/getProviders', getProviders);

module.exports = router;

//functions

function create(req, res, next) {
    providerService.create(req.body)
        .then(() => res.json({}))
        .catch(err => next(err));
}

function getAll(req, res, next) {
    providerService.getAll()
        .then(provider => res.json(provider))
        .catch(err => next(err));
}

function getProviders(req, res, next) {
    providerService.getProviders()
        .then(provider => res.json(provider))
        .catch(err => next(err));
}