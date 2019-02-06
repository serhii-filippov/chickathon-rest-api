'use strict';

const Log = require('../models/log');

module.exports = {
    addLog(req, res, next) {
// all data have to be send through request body
// put 1 into eventId, botId or battleId in case if log type is eventId, botId or battleId respectively
        const { type, content, status, eventId, botId, battleId } = req.body;
        if (status === undefined) {
            status = true
        }
        return Log
            .create({
                type: type || null,
                content: content || null,
// status of all logs is TRUE by default
                status:  status,
                eventId: Number(eventId) || null,
                botId: Number(botId) || null,
                battleId: Number(battleId) || null
            })
            .then(log => {
                res.status(201).json(log)
            })
            .catch(next)
    },

    updateCertainLog(req, res, next) {
        const id = req.params.id;
        const { type, content, status, eventId, botId, battleId } = req.body;

        if (status === undefined) {
            status = true
        }

        return Log
            .findByPk(id)
            .then(log => {
                if (log) {
                    return log
                        .update({
                            type: type || null,
                            content: content || null,
// status of all logs is TRUE by default
                            status:  status,
                            eventId: Number(eventId) || null,
                            botId: Number(botId) || null,
                            battleId: Number(battleId) || null
                        })
                        .then(result => {
                            res.status(200).json(result)
                        })
                        .catch(next)
                } else {
                    res.status(400).json(null)
                }
            })
            .catch(next)
    },

    findLogIdByBotId(req, res, next) {
        const id = req.params.id;

        return Log
            .findOne({
                where: {
                    botId: id
                }
            })
            .then(result => {
                if (result) {
                    res.status(200).json(result.id)
                } else {
                    res.status(404).json(null)
                }
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