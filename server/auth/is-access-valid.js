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
    isAccessTokenValid(req, res, next) {
        let result = {
            message: '',
            code: 0,
            status: false
        };
        const token = req.headers.authorization || req.body.authorization;

        return User
            .findOne({
                where: {
                    accessToken: token,
                }
            })
            .then( user => {
                if (token) {
                    jwt.verify(token, secret, options, (err, decodedAcces) => {
                        if (!err) {
                            jwt.verify(user.refreshToken, refreshSecret, refreshOptions, (err2, decodedRefresh) => {
                                if (!err2) {
                                    if (decodedAcces.iat == decodedRefresh.iat) {
                                        result.code = 200;
                                        result.status = true;
                                        return result;

                                    } else {
                                        result.code = 500;
                                        result.message += 'Access token do not belong to refresh token';    
                                    }
                                } else {
                                    result.code = 500;
                                    result.message += 'Error during access token verifying occured: ' + err2;
                                }
                            })
                        } else {
                            result.code = 500;
                            result.message += 'Error during access token verifying occured: ' + err;
                        }
                    })
                } else {
                    result.message += ' Access wasn\'t found in DB so it is not valid';
                    result.code = 400;
                }
                return result
            })
            .catch(next)
    }
};