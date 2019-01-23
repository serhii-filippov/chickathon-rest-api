'use strict';

const fileUpload = require('express-fileupload');
const serverError = require('../errors/errors').ServerError;
const winstonLogger = require('../errors/logger').WinLogger;
const userController = require('../controllers').users;
const botController = require('../controllers').bots;

module.exports = (app) => {
    app.get('/', (req, res) => {
        res.status(200).send('Welcome to the CHIckathon REST API');
    });

    app.post('/user', userController.addUser);
    app.get('/user/:id', userController.showProfile);
    app.get('/users', userController.showAllIds);
    app.get('/users/ids/updated-after', userController.showAllUsersUpdatedAfter)

    app.get('/bots', botController.showAllBots);
    app.get('/bots/:id', botController.getBotsViaUserId);
    app.get('/bots/updated/after', botController.showAllBotsUpdatedAfter);
    app.put('/bot/update/devrating/:id', botController.updateDevRating);
    app.put('/bot/update/eventrating/:id', botController.updateEventRating);
    app.get('/bot/source/:id', botController.getBotZippedSourceFile);
    app.delete('/bot/:id', botController.deleteBot);
    app.use(fileUpload());
    app.get('/bot', (req, res) => {
        res.sendFile(__dirname + '/bot-upload.html')
    })
    app.post('/bot', botController.addBot, botController.sourceUpload, botController.updateSourceFilePath);


    app.use(serverError.handle404Error);
    app.use(serverError.errorLogger);
    app.use(winstonLogger.winstonLogging);
    app.use(serverError.errorHandler);
}