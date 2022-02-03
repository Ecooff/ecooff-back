const db = require('_helpers/db');
const res = require('express/lib/response');
const Provider = db.Provider;

module.exports = {
    create
};

async function create(userParam) {
    if (await Provider.findOne({ provider: userParam.category })) {
        throw 'Ese proveedor ya existe';
    }

    const provider = new Provider(userParam);

    await provider.save();
}