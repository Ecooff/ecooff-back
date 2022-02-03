const express = require('express');
const router = express.Router();
const providerService = require('./provider.service');

//routes
router.post('/create', create);

module.exports = router;

//functions

function create(req, res, next) {
    providerService.create(req.body)
        .then(() => res.json({}))
        .catch(err => next(err));
}