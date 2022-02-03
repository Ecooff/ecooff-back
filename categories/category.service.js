const db = require('_helpers/db');
const Category = db.Category;

module.exports = {
    create
};

async function create(userParam) {
    if (await Category.findOne({ category: userParam.category })) {
        throw 'Esa categoria ya existe';
    }

    const category = new Category(userParam);

    await category.save();
}

