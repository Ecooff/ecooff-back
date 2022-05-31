const db = require('_helpers/db');
const res = require('express/lib/response');
const Provider = db.Provider;
const ObjectId = require('mongodb').ObjectId;

module.exports = {
    create,
    getAll,
    getById,
    getProviders
};

async function create(userParam) {

    const provider = new Provider(userParam);

    await provider.save();
    return provider;
}

async function getAll() {
    return await Provider.find();
}

async function getById(id) {
    return await Provider.findById(ObjectId(id));
}

async function getProviders() {
    return await Provider.find();
}