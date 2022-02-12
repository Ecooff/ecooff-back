const express = require('express');
const router = express.Router();
const providerService = require('./provider.service');

//routes
router.post('/create', create);
router.get('/', getAll);
router.get('/:id', getById);

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

function getById(req, res, next) {
    providerService.getById(req.params.id)
        .then(provider => provider ? res.json(provider) : res.sendStatus(404))
        .catch(err => next(err));
}