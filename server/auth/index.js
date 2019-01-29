'use strict';

const login = require('../auth/login');
const emitTokens = require('../auth/emit-tokens');
const isAccessTokenValid = require('../auth/is-access-valid');
const isRefreshTokenValid = require('../auth/is-refresh-valid');
const validateToken = require('../auth/validate-token');

module.exports = {
    login, emitTokens, isAccessTokenValid, isRefreshTokenValid, validateToken
};