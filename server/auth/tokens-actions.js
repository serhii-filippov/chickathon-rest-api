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
    login(req, res, next) {
        let { login, password } = req.body || req.headers || null;
        let result = {
            code: 0,
            message: '',
            error: ''
        };
        let status = 200;

        return User
            .findOne({
                where: {
                    login: login
                }
            })
            .then(user => {
                if (user) {
                    return bcrypt.compare(password, user.password)
                        .then(match => {
                            if (match) {
                                result.code = status;
                                result.message += '\nSuccesfully loged in';
                                
                                return true
                                
                            } else {
                                status = 401;
                                result.code = status;
                                result.message += '\nPassword doesn\'t match';
                                
                                return false
                            }
                        })
                        .catch(err => {
                            status = 500;
                            result.code = status;
                            result.message += String(err);

                            return false
                        })
                } else {
                    status = 404;
                    result.code = status;
                    result.message = 'No user with provided login is found';
                    
                    return false
                }
            })
    },

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
    },

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
    },

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
                        id: user.id,
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
    },

    validateToken(req, res, next) {
        let result;
        const token = req.headers.authorization || req.body.authorization;

        if (token) {
            try {
                result = jwt.verify(token, secret, options);
                res.isAdmin = result.isAdmin;
                // console.log(result);
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
}