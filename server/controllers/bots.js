'use strict';

const archivator = require('./archivator');
const path = require('path');
const fs = require('fs');

const User = require('../models/user');
const Bot = require('../models/bot');
const Log = require('../models/log');
const Battle = require('../models/battle');
const BotsBattle = require('../models/botsbattle');

const Sequelize = require('sequelize');
const Op = Sequelize.Op;

module.exports = {
    addBot(req, res, next) {
// send name and devLanguage into body of request
// userId will be taken from auth token
        const { name, devLanguage } = req.body;
        const userId = req.decoded.id;

        if (userId) {
            return Bot
                .findAll({
                    where: {
                        userId: userId
                    }
                })
                .then(bots => {
                    if (bots.length === 0) {
                        return Bot
                            .findAll({
                                where: {
                                    name: {
                                        [Op.iLike]: name
                                    }
                                }
                            })
                            .then(findedByNamesBots => {
                                if (findedByNamesBots.length === 0) {
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
                                    return res.status(400).json('Bot with provided name is already exists')
                                }
                            })
                            .catch(next)
                    } else {
                        return res.status(400).json('You can\'t create more than 1 bot')
                    }
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
            .findOne({
                where: {
                    userId: userId
                }
            })
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
                .findOne({
                    where: {
                        userId: userId                        
                    }
                })
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
                // archivator(req, res, bot.jarFile)
                // const name = String(req.params.name);
                const name = bot.jarFile.split('/')[3];
                const filePath = path.join(__dirname, '../files/replays/', name);
                const readStream = fs.createReadStream(filePath);
        
                readStream.pipe(res)
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
                    return Log
                        .findOne({
                            where: {
                                botId: bot.id,
                            },
                            through: {
                                attributes: ['status', 'content']
                            }
                        })
                        .then(log => {
                            let result;
                            if (log) {
                                result = {
                                    ...bot.get({
                                        plain: true
                                    }),
                                    status: log.status,
                                    content: log.content
                                }
                            } else {
                                result = {
                                    ...bot.get({
                                        plain: true
                                    }),
                                    status: log
                                }
                            }
                            return res.status(200).json(result)
                        })
                        .catch(next)
                } else {
                    return res.status(404).json('No bot belonged to your profile was found')
                }
            })
            .catch(next)
    },

    getCertainBot(req, res, next) {
        return Bot
            .findOne({
                where: {
                    id: req.params.id
                },
                // include: {
                //     model: User,
                //     attributes: ['login', 'department', 'updatedAt']
                // },
                include: {
                    model: Battle,
                    through: {
                        model: BotsBattle,
                    }
                }
            })
            .then(bot => {
                res.status(200).json(bot)
            })
    },

    getCertainBotSourceFile(req, res, next) {
        let fs = require('fs');
        let readStream;
        // let fileName = path.join(req.headers.fileName, 'server/files/bots-sources/');
        const id = req.params.id;

        return Bot
            .findByPk(id)
            .then(bot => {
                readStream = fs.createReadStream(bot.jarFile);
                readStream.pipe(res)
            })
            .catch(next)
    },

    getBotStatistic(req, res, next) {
        const userId = req.decoded.id;
        
        return Bot
            .findOne({
                where: {
                    userId: userId
                }
            })
            .then(bot => {
                if (bot) {
                    let myBotId = bot.id;
                    let myBotName = bot.name;

                    return BotsBattle
                        .findAll({
                            where: {
                                botId: myBotId
                            }
                        })
                        .then(botsBattles => {
                            const promises = [];

                            for (let i = 0; i < botsBattles.length; i++) {
// isWinner flag is false by default (in case if battle is not finished yet)
                                let isWinner = false;
                                let opponentBotName;

                                if (myBotId === botsBattles[i].result) {
                                    isWinner = true
                                } else if (botsBattles[i].result > 0) {
                                    isWinner = false
                                } else {
                                    isWinner = null;
                                }

                                const b = Battle
                                .findByPk(botsBattles[i].battleId)
                                    .then(findedBattles => {

                                        return BotsBattle
                                            .findAll({
                                                where: {
                                                    battleId: findedBattles.id,
                                                    botId: {
                                                        [Op.ne]: myBotId
                                                    }
                                                }
                                            })
                                            .then(opponentBot => {
                                                if (opponentBot.length > 0) {
                                                    let opponentBotId = opponentBot[0].botId;

                                                    return Bot
                                                        .findByPk(opponentBotId)
                                                        .then(findedOpponentBot => {
                                                            opponentBotName = findedOpponentBot.name;
                                                            
                                                            let botsStatisticObj = {
                                                                dateOfBattle: findedBattles.dateOfBattle,
                                                                replayFile: (findedBattles.replayFile)
                                                                    ? 'http://192.168.2.147:8000/battle/replay/' + findedBattles.replayFile.split('/')[3]
                                                                    : null,
                                                                myBotName: myBotName,
                                                                opponentBotName: opponentBotName,
                                                                isWinner: isWinner
                                                            }

                                                            return botsStatisticObj
                                                        })
                                                        // .catch(next)
                                                } else {
                                                    opponentBotName = null;
                                                    let botsStatisticObj = {
                                                        dateOfBattle: findedBattles.dateOfBattle,
                                                        replayFile: (findedBattles.replayFile)
                                                            ? 'http://192.168.2.147:8000/battle/replay/' + findedBattles.replayFile.split('/')[3]
                                                            : null,
                                                        myBotName: myBotName,
                                                        opponentBotName: opponentBotName,
                                                        isWinner: isWinner
                                                    }

                                                    return botsStatisticObj
                                                }
                                            })
                                            // .catch(next)
                                        
                                    })
                                    // .catch(next);

                                    promises.push(b);
                            }
                            return Promise.all(promises)
                                .then(result => {
                                    const sortedArr = result.sort((a, b) => new Date(b.dateOfBattle).getTime() - new Date(a.dateOfBattle).getTime());
                                    res.status(200).json(sortedArr);
                                })
                                .catch(next)
                        })
                        .catch(next)
                } else {
                    return res.status(400).json(null)
                }
            })
            .catch(next)
    },

    getReplayByLink(req, res, next) {
        const name = String(req.params.name);
        const filePath = path.join(__dirname, '../files/replays/', name);
        const readStream = fs.createReadStream(filePath);
        
        readStream.pipe(res)
    }
}