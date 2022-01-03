const fs = require('fs'),
    AWS = require('aws-sdk'),
    ID = 'AKIAJP6W64EFYFHWBWPA',
    SECRET = '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',
    BUCKET_NAME = 'inmemorias',
    s3 = new AWS.S3({
        accessKeyId: ID,
        secretAccessKey: SECRET
    }),
    multer = require('multer'),
    upload = multer({
        dest: 'uploads/'
    });

module.exports = (app, db, ObjectId) => {

    // REMEMBEREDS
    app.post('/api/remembereds/newRemembered', upload.single('file'), (req, res) => {

        let person = {
                name: req.body.name,
                lastName: req.body.lastName,
                fullName: req.body.name + ' ' + req.body.lastName,
                dateOfBirth: req.body.dateOfBirth,
                dateOfDeth: req.body.dateOfDeth,
                religionSimbol: req.body.religionSimbol,
                bio: req.body.bio,
                placeOfBirth: req.body.placeOfBirth,
                placeOfDeth: req.body.placeOfDeth,
                foto: req.body.foto,
                likes: [],
                userId: req.body.userId,
                postingDate: new Date(req.body.postingDate),
                published: req.body.published
            },
            database = db.db('inMemorian');

        uploadFile(req.file, person.foto)

        return database.collection('remembereds').insertOne(person, (err, result) => {

            if (err) {
                res.send({
                    'ERROR': err
                });
            } else {
                res.send(result.ops[0]);
            }

        });

    })
    uploadFile = (file, name) => {

        fs.readFile(file.path, (err, data) => {
            if (err) throw err;
            const params = {
                Bucket: BUCKET_NAME, // pass your bucket name
                Key: name, // file will be saved as testBucket/contacts.csv
                Body: data
            };
            s3.upload(params, function (s3Err, data) {
                if (s3Err) throw s3Err
                console.log(`File uploaded successfully at ${data}`)
            });
        });
    };

    app.post('/api/remembereds/getRememberedById', (req, res) => {

        let id = req.body.id,
            database = db.db('inMemorian');

        return database.collection('remembereds').findOne({
            '_id': ObjectId(id)
        }, (err, result) => {

            if (err) {
                res.send({
                    'ERROR': err
                });
            } else {
                res.send(result);
            }

        });

    });

    app.post('/api/remembereds/getRememberedByUserId', (req, res) => {

        let id = req.body.id,
            database = db.db('inMemorian');

        return database.collection('remembereds').find({
            'userId': id
        }).toArray((err, result) => {

            if (err) {
                res.send({
                    'ERROR': err
                });
            } else {
                res.send(result);
            }

        });

    });

    // COMMENTS
    app.post('/api/remembereds/newComment', (req, res) => {

        let comment = {
            name: req.body.name,
            lastName: req.body.lastName,
            fullName: req.body.fullName,
            userId: req.body.userId,
            text: req.body.text,
            rememberedId: req.body.rememberedId,
            postingDate: req.body.postingDate
        };
        database = db.db('inMemorian');

        return database.collection('comments').insertOne(comment, (err, result) => {

            if (err) {
                res.send({
                    'ERROR': err
                });
            } else {
                res.send(result.ops[0]);
            }

        });

    });

    app.post('/api/remembereds/getCommentsByRemembered', (req, res) => {

        let rememberedId = req.body.rememberedId;
        database = db.db('inMemorian');

        return database.collection('comments').find({
            'rememberedId': rememberedId
        }).toArray((err, result) => {

            if (err) {
                res.send({
                    'ERROR': err
                });
            } else {
                res.send(result);
            }

        });

    });

    app.post('/api/remembereds/searchRemembereds', (req, res) => {

        let query = req.body.query;
        database = db.db('inMemorian');

        if (query != null && query != '') {

            query = new RegExp(query, 'i');

            return database.collection('remembereds').find({
                $or: [{
                    fullName: {
                        $regex: query
                    }
                }, {
                    dateOfDeth: query
                }]
            }).toArray((err, result) => {

                if (err) {
                    res.send({
                        'ERROR': err
                    });
                } else {
                    res.send(result);
                }

            });

        } else {
            res.send([]);
        }

    });

    app.post('/api/remembereds/addLike', (req, res) => {

        let name = req.body.name,
            lastName = req.body.lastName,
            fullName = req.body.fullName,
            userId = req.body._id,
            id = req.body.rememberedId,
            database = db.db("inMemorian"),
            user = {
                name: name,
                lastName: lastName,
                fullName: fullName,
                userId: userId
            };

        database.collection('remembereds').updateOne({
            '_id': ObjectId(id)
        }, {
            $push: {
                likes: user
            }
        }, (err, result) => {
            if (err) {
                res.send({
                    'ERROR': err
                });
            } else {
                res.send(user);
            }
        });

    });

    app.post('/api/remembereds/removeLike', (req, res) => {

        let id = req.body.rememberedId,
            userId = req.body._id,
            database = db.db("inMemorian");

        database.collection('remembereds').findOneAndUpdate({
            '_id': ObjectId(id)
        }, {
            $pull: {
                likes: {
                    userId: userId
                }
            }
        }, {
            returnOriginal: false
        }, (err, result) => {
            if (err) {
                res.send({
                    'ERROR': err
                });
            } else {
                res.send(result.value.likes);
            }
        });

    });

};
