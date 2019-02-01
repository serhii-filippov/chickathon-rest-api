'use strict';

const Event = require('../models/event');
const Final = require('../models/final');
const eventId = require('../config/event.json').eventId;

module.exports = {
    createEvent(req, res, next) {
        const { startDate, endDate } = req.body;
        
        return Event
            .create({
                startDate: startDate,
                endDate: endDate
            })
            .then(result => res.status(200).json(result))
            .catch(next)
    },

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
        const id = (req.params && req.params.id) || eventId;
        const isEventEnded = (req.body && req.body.isEnded) || false;
        
        if (!id) return res.status(400).json('No Event ID was provided');

        return Event
            .findByPk(id)
            .then(event => {
                let { startDate, endDate, firstPlace, secondPlace, thirdPlace, isEnded } = req.body || {
                    startDate: event.startDate,
                    endDate: event.endDate,
                    firstPlace: event.firstPlace,
                    secondPlace: event.secondPlace,
                    thirdPlace: event.thirdPlace,
                    isEnded: isEventEnded
                };
                let eventObject = { event, startDate, endDate, firstPlace, secondPlace, thirdPlace, isEnded };
                if (eventObject.isEnded === undefined) {
                    eventObject.isEnded = false;
                }
                console.log('eventObject.isEnded = ', eventObject.isEnded)
                return eventObject
                })
            .then(eventObject => {
                if (isEventEnded) {
                    return Final
                        .findAll({
                            order: [
                                ['position']
                            ],
                            limit: 3
                        })
                        .then(finalists => {
                            return eventObject.event
                                .update({
                                    startDate: eventObject.startDate,
                                    endDate: eventObject.endDate,
                                    firstPlace: finalists[0].id,
                                    secondPlace: finalists[1].id,
                                    thirdPlace: finalists[2].id,
                                    isEnded: eventObject.isEnded
                                })
                                .then(result => {
                                    res.status(200).json('Event updated successfully. And has been closed. Result = ' + result);
                                })
                                .catch(next)
                        })
                        .catch(next)
                } else {
                    return eventObject.event
                        .update({
                            startDate: eventObject.startDate,
                            endDate: eventObject.endDate,
                            isEnded: eventObject.isEnded
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