'use strict';

const Final = require('../models/final');
const Bot = require('../models/bot');
// eventId is static value setted up in ../config/event.json
const eventId = require('../config/event.json').eventId;

module.exports = {
    createEntry(req, res, next) {
        const botId = (req.createdBotObject && req.createdBotObject.botId) || req.params.id;

        return Final
            .create({
                eventId: eventId,
                botId: botId,
                position: 0,
                score: 0
            })
            .then(() => res.status(200).send(`Successfully created entry in Finals for bot with ID = ${botId}`))
            .catch(next)
    },

    updateEntry(req, res, next) {
        const botId = (req.createdBotObject && req.createdBotObject.botId) || req.params.id;

        return Final
            .findOne({
                where: {
                    botId: botId
                },
                include: [
                    {
                        model: Bot,
                        required: true
                    }
                ]
            })
            .then(bot => {
                res.status(200).send(bot)
            })
            .catch(next)
        // добавить в конце этой фукнции фичу сортировки таблицы Finals по полю score
    }
}