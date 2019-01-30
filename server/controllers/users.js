'use strict';

const User = require('../models/user');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const bcrypt = require('bcrypt');

const jwt = require('jsonwebtoken');
const hashConfig = require('../auth/config');
const secret = hashConfig.JWT_SECRET;
const options = {
    expiresIn: '7d', 
    issuer: 'Great and Powerfull',
};

module.exports = {
// this middleware sends token in response
    addUser(req, res, next) {
        const { name, department, login, password } = req.body;
        
        return User
// check for uniqe login in DB for each new user
            .findAll({
                where: {
                    login: login
                }
            })
            .then(user => {
                if (!user) {
                    return User
                        .create({
                            fullName: name,
                            department: department,
                            login: login,
                            password: password
                        })
                        .then(user => {
                            const payload = { 
                                id: user.id,
                            };
                            let token = jwt.sign(payload, secret, options);
                            res.status(201).json({"token": token});
                        })
                        .catch(next)
                } else {
                    res.status(400).json('User with provided login is already exists. Try another login')
                }
            })
    },

    logIn(req, res, next) {
        const { login, password } = req.body;
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
                                    const payload = { 
                                        id: user.id,
                                    };
                                    let token = jwt.sign(payload, secret, options);
                                    res.status(201).json({"token": token});
                                    
                                } else {
                                    res.status(400).json('Wrong login or password. Try again.')
                                }
                            })
                            .catch(err => {
                                status = 500;
                                result.code = status;
                                result.message += String(err);

                                return false
                        })
                } else {
                    res.status(400).json('Wrong login or password. Try again.')
                }
            })
            .catch(next)
    },

    validateToken(req, res, next) {
        let result;
        const token = req.headers.token || req.body.token;

        if (token) {
            try {
                result = jwt.verify(token, secret, options);
                req.decoded = result;
                next();
            }
            catch(err) {
// in front-end enter here redirect for the log in page 
                result = {
                    error: `Your token has been expired. Go to login page to authentication`,
                    code: 401
                };
                res.status(result.code).json(result);
            }
        } else {
// in front-end enter here redirect for the log in page 
            result = {
                error: `Authentication error. Token required.`,
                code: 401
            };
            res.status(result.code).json(result);
        }
    },

    showProfile(req, res, next) {
        let id = Number(req.params.id) || null;
        const name = req.params.name || null;

        if (id) {
            return User
                .findByPk(req.params.id)
                .then(user => {
                    if (!user) {
                        return res.status(404).json('User with provided id is not found');
                    } else {
                        return res.status(200).json(user);
                    }
                })
                .catch(next)
        } else if (name) {
            return User
                .findAll({
                    where: {
                        fullName: name
                    }
                })
                .then(user => {
                    res.status(200).json(user);
                })
                .catch(next)
        } else {
            res.status(400).json('No username or his id was provided');
        }
    },

// returns array of users' IDs
    showAllIds(req, res, next) {
        let idsArray = [];

        return User
            .findAll()
            .then(users => {
                for (let key in users) {
                    idsArray.push(users[key].id)
                }
                console.log(idsArray);
                res.status(200).json(idsArray);
            })
            .catch(next)
    },

    showAllUsersUpdatedAfter(req, res, next) {
// date needs to be passed by updated_date variable through request headers in format YYYY-MM-DD GMT
        let neededDate = new Date(Date.parse(req.headers.updated_date));

        return User
            .findAll({
                where: {
                    updatedAt: {
                        [Op.gt]: neededDate
                    }
                }
            })
            .then(users => {
                res.status(200).json(users);
            })
            .catch(next)
    },

    updateProfile(req, res, next) {
        let decoded = jwt.verify(token, secret, options);
        let id = decoded.id;

        return User
            .findByPk(id)
            .then(user => {
                if (user) {
                    const { name, department, login, password } = req.body;
                    
                    return user
                        .update({
                            fullName: name || user.fullName,
                            department: department || user.department,
                            login: login || user.login,
                            password: password || user.password
                        })
                        .then(updatedUser => res.status(200).json(updatedUser))
                        .catch(next)
                } else {
                    res.status(404).json('No user with provided token was found. Try to re-sign in')
                }
            })
            .catch(next)
    },

    deleteUser(req, res) {

    }
}