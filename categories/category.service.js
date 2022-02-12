const db = require('_helpers/db');
const Category = db.Category;

module.exports = {
    create,
    getAll,
    getById
};

async function create(userParam) {
    if (await Category.findOne({ category: userParam.category })) {
        throw 'Esa categoria ya existe';
    }

    const category = new Category(userParam);

    await category.save();
}

async function getAll() {
    return await Category.find();
}

async function getById(id) {
    return await Category.findById(id);
}

