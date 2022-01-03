const nodemailer = require("nodemailer"),
    {
        google
    } = require("googleapis"),
    OAuth2 = google.auth.OAuth2,
    bcrypt = require("bcrypt-nodejs");

module.exports = function (app, db, ObjectId) {

    //  SERVER ALIVE
    app.get('/api/serverAlive', (req, res) => {
        res.send("Hello World");
    });

    //  AUTHENTICATION
    app.post('/api/authentication/newUser', (req, res) => {

        const user = {
                name: req.body.name,
                lastName: req.body.lastName,
                fullName: req.body.name + ' ' + req.body.lastName,
                password: req.body.password,
                email: req.body.email
            },

            unEncriptPws = req.body.password,
            database = db.db('inMemorian');

        bcrypt.hash(user.password, null, null, function (err, hash) {

            user.password = hash;

            return database.collection('users').insertOne(user, (err, result) => {
                if (err) {
                    res.send({
                        'ERROR': err
                    });
                } else {

                    const mailOptions = {
                        from: "Ultimate",
                        to: user.email,
                        subject: user.name + ", ya tienes acceso a UltiMate",
                        generateTextFromHTML: true,
                        html: "<h1><b>Bienvenido " + user.name + "</b></h1><p>Ya tienes acceso a tu cuenta en Ultimate. Tus datos de acceso son:</p><br><b>Nombre de ususario:</b> " + user.username + "<br><b>Constraseña:</b> " + unEncriptPws + "</b><br><p>Recomendamos que tras tu primer inicio de sesión, cambies tu contraseña clickeando el icono de candado ubicado del lado derecho del menu superior.</p>"
                    };
                    mailer(mailOptions);
                    res.send(result.ops[0]);

                }
            });

        });

    });

    app.post('/api/authentication/login', (req, res) => {

        let email = req.body.email,
            password = req.body.password,
            database = db.db('inMemorian');

        database.collection('users').findOne({
            'email': email
        }, (err, result) => {
            if (err) {
                res.send({
                    'ERROR': err
                });
            } else {

                if (result != null) {

                    bcrypt.compare(password, result.password, function (err, equal) {

                        if (equal) {

                            delete result.password;
                            res.send(result);


                        } else {
                            res.status(422).send('Datos incorrectos');
                        }

                    });

                } else {
                    res.status(422).send('Datos incorrectos');
                }

            }
        });

    });

    app.post('/api/authentication/updatePws', (req, res) => {

        let id = req.body.id,
            password = req.body.password,
            database = db.db('inMemorian');

        bcrypt.hash(password, null, null, function (err, hash) {

            password = hash;

            return database.collection('users').updateOne({
                '_id': ObjectId(id)
            }, {
                $set: {
                    password: password
                }
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

    });

    app.get('/api/authentication/forgotPsw', (req, res) => {

        let user = req.query.user,
            database = db.db('inMemorian');

        database.collection('users').findOne({
            $or: [{
                'username': user
            }, {
                'email': user
            }]
        }, (err, result) => {
            if (err) {
                res.send({
                    'ERROR': err
                });
            } else {
                if (result != null) {

                    let link,
                        token = {
                            userId: result._id,
                            date: new Date().getTime()
                        }

                    database.collection('tokens').insertOne(token, (err, resultToken) => {
                        if (err) {
                            res.send({
                                'ERROR': err
                            });
                        } else {

                            link = "http://buenosdiasbirding.com/birdingmanager/restore/index.html?token=" + resultToken.ops[0]._id;

                            const mailOptions = {
                                from: "Ultimate",
                                to: result.email,
                                subject: "Restablece tu contraseña, " + result.name,
                                generateTextFromHTML: true,
                                html: '<h1><b>' + result.name + ' ¿Olvidaste tu contraseña?</b></h1><p>Para restablecer tu contraseña clickea en el siguiente link:</p><a href="' + link + '">' + link + '</a>'
                            };

                            mailer(mailOptions);

                            res.send({
                                statur: 'OK'
                            });

                        }

                    });

                } else {
                    res.status(400);
                    res.send({
                        message: 'No hay ningun usuario en UltiMate con la información que has proporcionado'
                    });
                }

            }
        });

    });

    app.get('/api/authentication/restoreToken', (req, res) => {

        let token = req.query.token,
            database = db.db('inMemorian');

        database.collection('tokens').findOne({
            '_id': ObjectId(token)
        }, (err, result) => {
            if (err) {
                res.send({
                    'ERROR': err
                });
            } else {

                if (result != null) {

                    // 3 Hors
                    if (new Date().getTime() - result.date < 10800000) {

                        res.send(result);

                    } else if (new Date().getTime() - result.date < 86400000) {

                        res.status(410);
                        res.send({
                            message: 'Token expirado'
                        });

                    } else {

                        res.status(404);
                        res.send({
                            message: 'Token invalido'
                        });

                    }

                } else {

                    res.status(404);
                    res.send({
                        message: 'Token invalido'
                    });

                }

            }
        });

    });

    app.post('/api/authentication/restorePws', (req, res) => {

        let id = req.body.id,
            token = req.body.token,
            password = req.body.password,
            database = db.db('inMemorian');

        bcrypt.hash(password, null, null, function (err, hash) {

            password = hash;

            return database.collection('users').updateOne({
                '_id': ObjectId(id)
            }, {
                $set: {
                    password: password
                }
            }, (err, updateResult) => {
                if (err) {
                    res.send({
                        'ERROR': err
                    });
                } else {

                    database.collection('tokens').remove({
                        '_id': ObjectId(token)
                    }, (err, result) => {
                        if (err) {
                            res.send({
                                'ERROR': err
                            });
                        } else {
                            res.send({
                                status: "OK"
                            });
                        }
                    });

                }
            });

        });

    });

    mailer = async (mailOptions) => {

        const oauth2Client = new OAuth2(
            "257052932255-of1ud9hif4k7hfeqrmohuq9nqqh81g5i.apps.googleusercontent.com",
            "1ogMbeEgtmFBeMUiKeoP9soR",
            "https://developers.google.com/oauthplayground"
        );

        oauth2Client.setCredentials({
            refresh_token: "1/WcLnzht16R7TerSMWDSfeDcjJj53JzNm4GBbr0HC3kg",
        });
        const tokens = await oauth2Client.refreshAccessToken();
        const accessToken = tokens.credentials.access_token;

        const smtpTransport = nodemailer.createTransport({
            service: "gmail",
            auth: {
                type: "OAuth2",
                user: "auth.ultimate@gmail.com",
                clientId: "257052932255-of1ud9hif4k7hfeqrmohuq9nqqh81g5i.apps.googleusercontent.com",
                clientSecret: "1ogMbeEgtmFBeMUiKeoP9soR",
                refreshToken: "1/WcLnzht16R7TerSMWDSfeDcjJj53JzNm4GBbr0HC3kg",
                accessToken: accessToken
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        smtpTransport.sendMail(mailOptions, (error, response) => {
            error ? console.log(error) : console.log(response);
            smtpTransport.close();
        });

    };

};
