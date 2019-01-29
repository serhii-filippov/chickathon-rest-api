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
    }
};