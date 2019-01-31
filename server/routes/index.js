'use strict';

const cors = require('cors');

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
// using cors module for providing a Connect/Express middleware
    app.use(cors());

    app.get('/', (req, res) => {
        res.status(200).send('Welcome to the CHIckathon REST API');
    });

    app.post('/user', userController.addUser);
    app.get('/user', userController.validateToken, userController.showProfile);
    app.get('/userers', userController.showAllIds);
    app.get('/users/ids/updated-after', userController.showAllUsersUpdatedAfter);
    app.put('/user/update', userController.validateToken, userController.updateProfile);
    app.post('/user/login', userController.logIn);
// 'admin' route for getting any user info through his ID
    app.get('/user/info/:id', userController.showProfile);

    app.post('/log', logController.addLog);
    app.get('/log/:id', logController.showCertainLog);
    app.get('/logs', logController.showAllLogs);

    app.post('/battle', battleController.createBattle);
    app.get('/battles', battleController.showAllBattles);
    app.get('/battle/:id', battleController.showBattleDetails);

    app.get('/events', eventController.showAllEvents);
    app.get('/event/:id', eventController.isEnded, eventController.showCertainEvent)
    app.put('/event/:id', eventController.updateEvent);

    app.get('/final/:id', finalController.showCertainEntry);
    app.post('/final/:id', finalController.updateEntry);

    app.get('/bots', botController.showAllBots);
// 'admin' route for getting every single bot details
    app.get('/boterrers/:id', botController.getCertainBot);
// regular route for getting user's own bot details
    app.get('/bot', userController.validateToken, botController.getMyBotInfo);
    app.get('/bots/:id', botController.getBotsViaUserId);
    app.get('/bots/updated/after', botController.showAllBotsUpdatedAfter);
    app.put('/bot/update/devrating/:id', botController.updateDevRating);
    app.put('/bot/update/eventrating/:id', botController.updateEventRating, finalController.updateEntry);
    app.get('/bot/source', userController.validateToken, botController.getBotZippedSourceFile);
//  app.delete('/boterrerrs/:id', botController.deleteBot);
    
    app.use(fileUpload());
// replace next 3 rows with front-end page with "bot upload" functionality
    app.get('/bot/upload', (req, res) => {
        res.sendFile(__dirname + '/bot-upload.html');
    });
    app.post('/bot', userController.validateToken, botController.addBot, botController.sourceUpload, botController.updateSourceFilePath, finalController.createEntry);
    app.put('/bot', userController.validateToken, botController.sourceUpload2, botController.updateSourceFilePath);

// replace next 3 rows with client page with "replay upload" functionality
    app.get('/battle', (req, res) => {
        res.sendFile(__dirname + '/replay-upload.html');
    });
    app.put('/battle/:id', battleController.replayFileUpload, battleController.updateBattle);
    app.put('/battle/update/:id', battleController.updateBattle);

    app.use(serverError.handle404Error);
    app.use(serverError.errorLogger);
    app.use(winstonLogger.winstonLogging);
    app.use(serverError.errorHandler);
}