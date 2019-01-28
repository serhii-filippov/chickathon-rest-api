'use strict';

const fileUpload = require('express-fileupload');
const serverError = require('../errors/errors').ServerError;
const winstonLogger = require('../errors/logger').WinLogger;
const userController = require('../controllers').users;
const botController = require('../controllers').bots;
const logController = require('../controllers').logs;
const battleController = require('../controllers').battles;
const eventController = require('../controllers').events;
const finalController = require('../controllers').finals;

module.exports = (app) => {
    app.get('/', (req, res) => {
        res.status(200).send('Welcome to the CHIckathon REST API');
    });

    app.post('/user', userController.addUser);
    app.get('/user/:id', userController.showProfile);
    app.get('/users', userController.showAllIds);
    app.get('/users/ids/updated-after', userController.showAllUsersUpdatedAfter);

    app.post('/log', logController.addLog);
    app.get('/logs', logController.showAllLogs);

    app.get('/battles', battleController.showAllBattles);
    app.get('/battle/:id', battleController.showBattleDetails);
    app.put('/battle/update/:id', battleController.updateBattle);

    app.get('/events', eventController.showAllEvents);
    app.put('/event/:id', eventController.updateEvent);

    app.post('/final/:id', finalController.updateEntry);

// добавить триггер, который будет срабатывать при создании записи в таблице Bots
// а также при всех изменениях в ней; по срабатыванию триггера должен срабатывать мидлвэр на обновление
// соответствующей записи в Finals
    app.get('/bots', botController.showAllBots);
    app.get('/bots/:id', botController.getBotsViaUserId);
    app.get('/bots/updated/after', botController.showAllBotsUpdatedAfter);
    app.put('/bot/update/devrating/:id', botController.updateDevRating);
    app.put('/bot/update/eventrating/:id', botController.updateEventRating);
    app.get('/bot/source/:id', botController.getBotZippedSourceFile);
    app.delete('/bot/:id', botController.deleteBot);
    
    app.use(fileUpload());
    app.get('/bot', (req, res) => {
        res.sendFile(__dirname + '/bot-upload.html');
    });
    app.post('/bot', botController.addBot, botController.sourceUpload, botController.updateSourceFilePath);
    app.put('/bot/:id', botController.sourceUpload2, botController.updateSourceFilePath);

    app.get('/battle', (req, res) => {
        res.sendFile(__dirname + '/replay-upload.html');
    });
    app.post('/battle', battleController.createBattle);
    // app.post('/battle', battleController.createBattle, battleController.replayFileUpload, battleController.updateBattle);
    app.put('/battle/:id', battleController.replayFileUpload);
    app.put('/battle/:id', battleController.replayFileUpload, battleController.updateBattle);

    app.use(serverError.handle404Error);
    app.use(serverError.errorLogger);
    app.use(winstonLogger.winstonLogging);
    app.use(serverError.errorHandler);
}