const express = require('express'),
    bodyParser = require('body-parser'),
    MongoClient = require('mongodb').MongoClient,
    app = express(),
    port = 3000,
    db = require('./config/db'),
    cors = require('cors');

app.use(cors());
app.use(bodyParser.json());

MongoClient.connect(db.localhost, (err, database) => {

    if (err) return console.log(err)

    require('./app/routes')(app, database);
    app.listen(port, () => {
        console.log("Server running on " + port);
    });

});
