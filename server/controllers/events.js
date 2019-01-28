'use strict';

const Event = require('../models/event');

module.exports = {
    showAllEvents(req, res, next) {
        return Event
            .findAll()
            .then(events => {
                res.status(200).send(events)
            })
            .catch(next)
    },

    updateEvent(req, res, next) {
        const id = req.params.id;
        
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
            
            return eventOjbect
            })
        .then(eventOjbect => {
            return eventOjbect.event
                .update({
                    startDate: eventOjbect.startDate,
                    endDate: eventOjbect.endDate,
                    firstPlace: eventOjbect.firstPlace,
                    secondPlace: eventOjbect.secondPlace,
                    thirdPlace: eventOjbect.thirdPlace,
                    isEnded: eventOjbect.isEnded
                })
                .then(result =>{
                    res.send('Event updated successfully');
                })
                .catch(next)
        })
        .catch(next)
    }
}