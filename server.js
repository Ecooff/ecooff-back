require('rootpath')();
const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('_helpers/jwt');
const errorHandler = require('_helpers/error-handler');

//Middelware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

// use JWT auth to secure the api
app.use(jwt());

// api routes
app.use('/api/users', require('./users/users.controller'));

// global error handler
app.use(errorHandler);

// start server
const port = 3000;
const server = app.listen(port, function () {
    console.log('Server running on port ' + port);
});
