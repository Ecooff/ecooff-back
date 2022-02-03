const express = require('express');
const router = express.Router();
const stockService = require('./stock.service');

//routes
router.post('/create', create);

module.exports = router;

//functions

function create(req, res, next) {
    stockService.create(req.body)
        .then(() => res.json({}))
        .catch(err => next(err));
}