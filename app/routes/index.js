const ObjectId = require('mongodb').ObjectId,
      authentication = require('./apis.authentication'),
      remembereds = require('./apis.remembereds');

module.exports = function (app, db) {

    authentication(app, db, ObjectId);

    remembereds(app, db, ObjectId);

}
