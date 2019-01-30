'use strict';

const Log = require('../models/log');

module.exports = {
    addLog(req, res, next) {
// all data have to be send through request body
// put 1 into eventId, botId or battleId in case if log type is eventId, botId or battleId respectively
        const { type, content, status, eventId, botId, battleId } = req.body;

        return Log
            .create({
                type: type || null,
                content: content || null,
// status of all logs is TRUE by default
                status: status || true,
                eventId: eventId || 0,
                botId: botId || 0,
                battleId: battleId || 0
            })
            .then(log => {
                res.status(201).json(log)
            })
            .catch(next)
    },

    showCertainLog(req, res, next) {
        return Log
            .findByPk(req.params.id)
            .then(log => {
                res.status(200).json(log)
            })
            .catch(next)
    },

    showAllLogs(req, res, next) {
        return Log
            .findAll()
            .then(logs => {
                res.status(200).json(logs)
            })
            .catch(next)
    }
}