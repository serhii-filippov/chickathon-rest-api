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
    isRefreshTokenValid(req, res, next) {
        let result = {
            message: '',
            code: 0,
            status: false
        };
        const refreshToken = req.headers.refresh_token || req.body.refresh_token || null;

        return User
            .findOne({
                where: {
                    refreshToken: refreshToken
                }
            })
            .then(user => {
                return jwt.verify(user.refreshToken, refreshSecret, refreshOptions, (err, decoded) => {
                    if (!err || String(err) == 'TokenExpiredError: jwt expired') {
                        result.message += ' Refresh token valided. New couple of tokens will be emited now.';
                        result.code = 200;
                        result.status = true;

                        return result;
                        
                    } else {
                        result.message += ' Error during refresh token validation occured = ' + err;
                        result.code = 400;
                    }
                    
                    return result
                })
            })
            .catch(err => {
                result.message += ' Provided refresh was not found in DB. Log in required';
                result.code = 401;
                result.error = err;
                
                return result;          
            })
    }
};