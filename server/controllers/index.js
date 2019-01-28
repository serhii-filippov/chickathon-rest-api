'use strict';

const users = require('../controllers/users');
const bots = require('../controllers/bots');
const logs = require('../controllers/logs');
const battles = require('../controllers/battles');
const events = require('../controllers/events');
const finals = require('../controllers/finals');

module.exports = {
    users, bots, logs, battles, events, finals
}