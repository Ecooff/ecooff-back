const express = require('express');
const router = express.Router();
const productService = require('./product.service');

//routes
router.post('/create', create);

module.exports = router;

//functions

function create(req, res, next) {
    productService.create(req.body)
        .then(() => res.json({}))
        .catch(err => next(err));
}