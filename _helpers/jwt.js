const expressJwt = require('express-jwt');
const config = require('config.json');
const userService = require('../users/user.service');
const shippingUserService = require('../shippingUsers/shippingUser.service');

module.exports = jwt;

function jwt() {
    const secret = config.secret;
    return expressJwt({ secret, algorithms: ['HS256'], isRevoked }).unless({
        path: [
            // public routes that don't require authentication
            '/api/users/authenticate',
            '/api/users/register',
            '/api/users/forgotPasswordRequest',
            '/api/users/forgotPasswordTokenOnly',
            '/api/users/forgotPasswordUpdate',
            '/api/users/verifyEmail',
            '/api/users/resendVerify',
            '/shipping/auth/register',
            '/shipping/auth/authenticate'
        ]
    });
}

async function isRevoked(req, payload, done) {
    const user = await userService.getById(payload.sub);

    // revoke token if user no longer exists
    if (!user) {

        const shippingUser = await shippingUserService.getById(payload.sub);

        if (!shippingUser) {

            return done(null, true);

        }
    }

    done();
};