'use strict';

const Log = require('../models/log');

module.exports = {
    addLog(req, res, next) {
// all data have to be send through request body
// put 1 into eventId, botId or battleId in case if log type is eventId, botId or battleId respectively
        const { type, content, eventId, botId, battleId } = req.body;

        return Log
            .upsert({
                type: type || null,
                content: content || null,
                eventId: eventId || 0,
                botId: botId || 0,
                battleId: battleId || 0
            })
            .then(() => {
                res.status(200).send('New log has been created')
            })
            .catch(next)
    },

    showAllLogs(req, res, next) {
        return Log
            .findAll()
            .then(logs => {
                res.status(200).send(logs)
            })
            .catch(next)
    }
}