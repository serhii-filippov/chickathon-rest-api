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
            .then(() => {})
            .catch(next)
    },

    updateEntry(req, res, next) {
        const botId = (req.createdBotObject && req.createdBotObject.botId) || req.params.id;
        const newRating = (req.createdBotObject && req.createdBotObject.newRating) || 10000;

        return Final
            .findOne({
                where: {
                    botId: botId
                }
            })
            .then(final => {
                return final
                    .update({
                        score: newRating
                    })
                    .then(() => {
                        return Final
                            .findAll({
                                order: [
                                    ['score', 'DESC']
                                ]
                            })
                            .then(finals => {
                                for (let i = 0; i < finals.length; i++) {
                                    let position = i + 1;
                                    let id = finals[i].id;

                                    Final
                                        .findByPk(id)
                                        .then(final => {
                                            final
                                                .update({
                                                    position: position
                                                })
                                        })
                                        .catch(next)
                                }
                                res.status(200).json('Successfully updated all!');
                            })
                            .catch(next)
                    })
                    .catch(next)
            })
            .catch(next)
    },

    showCertainEntry(req, res, next) {
        return Final
            .findOne({
                where: {
                    id: req.params.id
                },
                include: {
                    model: Bot
                }
            })
            .then(final => {
                res.json(final)
            })            
    }
}