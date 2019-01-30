'use strict';

const Event = require('../models/event');
const Final = require('../models/final');
const eventId = require('../config/event.json').eventId;

module.exports = {
    showAllEvents(req, res, next) {
        return Event
            .findAll()
            .then(events => {
                res.status(200).json(events)
            })
            .catch(next)
    },

    showCertainEvent(req, res, next) {
        if (req.eventObject.isEnded) {
            return Event
                .findByPk(req.params.id)
                .then(event => {
                    res.status(200).json(event)
                })
                .catch(next)
        } else res.status(400).json('Event still flows');
    },

// when isEnded field turns into true
// the top 3 bots will be entered in corresponding rows
    updateEvent(req, res, next) {
        const id = req.params.id || eventId;
        const isEventEnded = req.body.isEnded || false;
        
        return Event
        .findByPk(id)
        .then(event => {
            let { startDate, endDate, firstPlace, secondPlace, thirdPlace, isEnded } = req.body || {
                startDate: event.startDate,
                endDate: event.endDate,
                firstPlace: event.firstPlace,
                secondPlace: event.secondPlace,
                thirdPlace: event.thirdPlace,
                isEnded: event.isEnded
            };
            let eventOjbect = { event, startDate, endDate, firstPlace, secondPlace, thirdPlace, isEnded };
            console.log('сейчас isEventEnded = ', isEventEnded);

            return eventOjbect
            })
        .then(eventOjbect => {
            if (isEventEnded) {
                return Final
                    .findAll({
                        order: [
                            ['position']
                        ],
                        limit: 3
                    })
                    .then(finalists => {
                        return eventOjbect.event
                            .update({
                                startDate: eventOjbect.startDate,
                                endDate: eventOjbect.endDate,
                                firstPlace: finalists[0].id,
                                secondPlace: finalists[1].id,
                                thirdPlace: finalists[2].id,
                                isEnded: eventOjbect.isEnded
                            })
                            .then(result => {
                                res.status(200).json('Event updated successfully. And has been closed. Result = ' + result);
                            })
                            .catch(next)
                    })
                    .catch(next)
            } else {
                return eventOjbect.event
                    .update({
                        startDate: eventOjbect.startDate,
                        endDate: eventOjbect.endDate,
                        isEnded: eventOjbect.isEnded
                    })
                    .then(result =>{
                        res.status(200).json(result);
                    })
                    .catch(next)
            }
        })
        .catch(next)
    },

    updateEventAfterEnd(req, res, next) {
        if (req.eventObject.isEnded) {
            return 
        }
    },

    isEnded(req, res, next) {
        return Event
            .findByPk(req.params.id)
            .then(event => {
                req.eventObject = {
                    isEnded: event.isEnded
                };

                next()
            })
    }
}