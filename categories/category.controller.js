const express = require('express');
const router = express.Router();
const categoryService = require('./category.service');

//routes
router.post('/create', create);

module.exports = router;

//functions

function create(req, res, next) {
    categoryService.create(req.body)
        .then(() => res.json({}))
        .catch(err => next(err));
}