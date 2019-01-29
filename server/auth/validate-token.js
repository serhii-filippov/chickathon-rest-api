'use strict';

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const hashConfig = require('../auth/config');
const User = require('../models').User;

const options = {
    expiresIn: '2h', 
    issuer: 'Great and Powerfull',
};
const refreshOptions = {
    expiresIn: '5d',
    issuer: 'Great and Powerfull',
};
const secret = hashConfig.JWT_SECRET;
const refreshSecret = hashConfig.jwt_refresh_secret;

module.exports = {
    validateToken(req, res, next) {
        let result;
        const token = req.headers.authorization || req.body.authorization;

        if (token) {
            try {
                result = jwt.verify(token, secret, options);
                res.isAdmin = result.isAdmin;
                console.log(result);
                next();
            }
            catch(err) {
                result = {
                    error: `Your token has been expired. Go to login page to authentication`,
                    code: 401
                };
                res.status(result.code).send(result);
            }
        } else {
            result = {
                error: `Authentication error. Token required.`,
                code: 401
            };
            res.status(result.code).send(result);
        }
    }
};