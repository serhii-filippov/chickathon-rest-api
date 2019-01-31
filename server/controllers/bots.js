'use strict';

const archivator = require('./archivator');
const path = require('path');
const User = require('../models/user');
const Bot = require('../models/bot');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

module.exports = {
    addBot(req, res, next) {
// send name and devLanguage into body of request
// userId will be taken from auth token
        const { name, devLanguage } = req.body;
        const userId = req.decoded.id;
        // const name = 'bot2 name',
        // userId = 2,
        // devLanguage = 'bot2 devLanguage';

        if (userId) {
            return Bot
                .create({
                    name: name,
                    userId: Number(userId),
                    devLanguage: devLanguage
                })
                .then(createdBot => {
                    req.createdBotObject = {
                        botId: createdBot.id,
                        botFileName: String(userId) + '-' + name.split(' ').join('-'),
                        name: name,
                        userId: userId,
                        devLanguage: devLanguage
                    };
                    next()
                })
                .catch(next)
        } else {
            res.status(400).json('No permition to create bots. You are not signed in.')
        }
    },
        
    sourceUpload(req, res, next) {
        if (Object.keys(req.files).length == 0) {
            return res.status(400).json('No bot file was provided');
        }
// botSourceFile is the name of the input field in the bot creation form
// need to add ' encType="multipart/form-data" ' (without '') to the form attributes
        let botSourceFile = req.files.botSourceFile;
        let fileExtension = String('.' + botSourceFile.name.split('.').slice(-1));
        const fileName = req.createdBotObject.botFileName + fileExtension;
        const jarFile = 'server/files/bots-sources/' + fileName;
        
        botSourceFile.mv(jarFile, () => {
            req.createdBotObject.jarFile = jarFile;
            next();
        })        
    },

    sourceUpload2(req, res, next) {
        const userId = req.decoded.id;
        if (Object.keys(req.files).length == 0) {
            return res.status(400).json('No bot file was provided');
        }
// botSourceFile is the name of the input field in the bot creation form
// need to add ' encType="multipart/form-data" ' (without '') to the form attributes

        return Bot
            .findByPk(userId)
            .then(bot => {
                let botSourceFile = req.files.botSourceFile;
                let fileExtension = String('.' + botSourceFile.name.split('.').slice(-1));
                const botFileName = String(bot.userId) + '-' + bot.name.split(' ').join('-');
                const fileName = botFileName + fileExtension;
                const jarFile = path.join('server/files/bots-sources/', fileName);
                
                botSourceFile.mv(jarFile, () => {
                    req.createdBotObject = { jarFile };
                    next();
                })
            })
            .catch(next)
    },

    updateSourceFilePath(req, res, next) {
// in case if bot was just created
        const userId = req.decoded.id;
        if (!userId) {
            return Bot
                .findOne({
                    where: {
                        name: req.createdBotObject.name,
                        userId: req.createdBotObject.userId,
                        devLanguage: req.createdBotObject.devLanguage
                    }
                })
                .then(bot => {
                    return bot
                        .update({
                            jarFile: req.createdBotObject.jarFile,
                            jarFileUpdateDate: new Date()
                        })
                        .then(() => {
                            res.status(200).json(bot);
                            next()
                        })
                        .catch(next)
                })
                .catch(next)
// in case we want to update existing bot source file
        } else {
            return Bot
                .findByPk(userId)
                .then(bot => {
                    return bot
                        .update({
                            jarFile: req.createdBotObject.jarFile,
                            jarFileUpdateDate: new Date()
                        })
                        .then(result => {
                            res.status(200).json(result);
                        })
                })
        }
    },

    getBotsViaUserId(req, res, next) {
        return Bot
            .findAll({
                where: {
                    userId: req.params.id
                }
            })
            .then(bots => {
                if (bots) {
                    return res.status(200).json(bots)
                } else {
                    return res.status(404).json('No bots with provided user\'s ID was found')
                }
            })
            .catch(next)
    },

    showAllBotsUpdatedAfter(req, res, next) {
// date needs to be passed by updated_date variable through request headers in format YYYY-MM-DD GMT
        let neededDate = new Date(Date.parse(req.headers.updated_date));

        return Bot
            .findAll({
                where: {
                    updatedAt: {
                        [Op.gt]: neededDate
                    }
                }
            })
            .then(bots => {
                if (bots) {
                    return res.status(200).json(bots)
                } else {
                    return res.status(404).json('No bots created or updated after given date was found')
                }
            })
            .catch(next)
    },

    getBotZippedSourceFile2(req, res, next) {
        const path = require('path');
        const fs = require('fs');

        return Bot
        .findByPk(req.params.id)
        .then(bot => {
            const bareOriginFileName = path.basename(bot.jarFile);
            const bareOriginDirPath = path.dirname(bot.jarFile);
            let fileName = bareOriginFileName + '.gz';
            const fileDir = path.join(bareOriginDirPath, 'archives');
            const filePath = path.join(fileDir, fileName);

            const zlib = require('zlib');
            const gzip = zlib.createGzip();
            const temp2 = path.join(bareOriginDirPath, bareOriginFileName);

            const inp = fs.createReadStream(temp2);
            const out = fs.createWriteStream(filePath);

            inp.pipe(gzip).pipe(out);
  
        })
        .catch(next)
    },

    getBotZippedSourceFile(req, res, next) {
        const userId = req.decoded.id;

        return Bot
            .findOne({
                where: {
                    userId: userId
                }
            })
            .then(bot => {
                archivator(req, res, bot.jarFile)
            })
            .catch(next)
    },

    showAllBots(req, res, next) {
        return Bot
            .findAll()
            .then(bots => {
                res.status(200).json(bots)
            })
            .catch(next)
    },

// updated dev rating value needs to be passed by newRating variable through request body
// type should be real (number with floating dot), not string
    updateDevRating(req, res, next) {
        const updatedDevRating = req.body.newRating;
        
        if (updatedDevRating) {
            return Bot
                .findByPk(req.params.id)
                .then(bot => {
                    req.createdBotObject = {
                        botId: bot.id
                    }
                    return bot
                        .update({
                            devRating: updatedDevRating
                        })
                        .then(() => {
                            res.status(200).json('Bot dev rating updated successfully');
                        })
                        .catch(next)
                })
                .catch(next)
        } else {
            res.status(400).json('Dev rating value was not provided');
        }
    },

// updated event rating value needs to be passed by newRating variable through request body
// type should be real (number with floating dot), not string
    updateEventRating(req, res, next) {
        const updatedEventRating = req.body.newRating;
        
        if (updatedEventRating) {
            return Bot
                .findByPk(req.params.id)
                .then(bot => {
                    req.createdBotObject = {
                        botId: bot.id,
                        newRating: updatedEventRating
                    }
                    return bot
                        .update({
                            eventRating: updatedEventRating
                        })
                        .then(() => {
                            next()
                        })
                        .catch(next)
                })
                .catch(next)
        } else {
            res.status(400).json('Event rating value was not provided');
        }
    },

    deleteBot(req, res, next) {
        return Bot
            .findByPk(req.params.id)
            .then(bot => {
                if (!bot) {
                    return res.status(404).json('No bot with provided id was founded')
                }
                return bot
                    .destroy()
                    .then(() => res.status(204).json('Bot deleted'))
                    .catch(next)
            })
            .catch(next)
    },

    getMyBotInfo(req, res, next) {
        const userId = req.decoded.id;

        return Bot
            .findOne({
                where: {
                    userId: userId
                }
            })
            .then(bot => {
                if (bot) {
                    return res.status(200).json(bot)
                }
                return res.status(400).json('No bot was found. Try to add some or go to log in page')
            })
            .catch(next)
    },

    getCertainBot(req, res, next) {
        return Bot
            .findOne({
                where: {
                    id: req.params.id
                },
                include: {
                    model: User
                }
            })
            .then(bot => {
                res.status(200).json(bot)
            })
    }
}