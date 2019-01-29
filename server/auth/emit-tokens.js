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
    emitTokens(req, res, next) {
        let { login } = req.body || req.headers || null;
        let status = 200;
        let result = {};

        return User
            .findOne({
                where: {
                    login: login
                }
            })
            .then((user) => {
                if (user) {
                    const payload = { 
                        admin: user.isAdmin,
                    };

                    const token = jwt.sign(payload, secret, options);
                    const refreshToken = jwt.sign(payload, refreshSecret, refreshOptions);

                    user.accessToken = token;
                    user.refreshToken = refreshToken;
                    result.token = token;
                    result.refreshToken = refreshToken;
                    result.code = status;
                    result.status = true;
                    result.message = 'New couple of tokens was emitted successfully'
                    
                    return user
                        .update({
                            accessToken: token,
                            refreshToken: refreshToken
                        },
                        {
                            where: {
                                login: login
                            }
                        })
                        .then(() => {
                            return result
                        });
                } else {
                    status = 404;
                    result.code = status;
                    result.error += '\User not found';
                }
                
                res.status(result.status).send(result.token, result.refreshToken);
                return result
            })
            .catch(err => {
                status = 500;
                result.code = status;
                result.error = err;

                res.status(status).send(result);
            })
    }
}