'use strict';

const archivator = require('./archivator');

const Bot = require('../models/bot');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

module.exports = {
    addBot(req, res, next) {
// send name, userId and devLanguage through body
        const { name, userId, devLanguage } = req.body;

        return Bot
            .upsert({
                name: name,
                userId: Number(userId),
                devLanguage: devLanguage
            })
            .then(() => {
                req.createdBotObject = {
                    botFileName: userId + '-' + name.split(' ').join(''),
                    name: name,
                    userId: userId,
                    devLanguage: devLanguage
                };
                next()
            })
            .catch(next)
    },
        
    sourceUpload(req, res, next) {
        if (Object.keys(req.files).length == 0) {
            return res.status(400).send('No bot file was provided');
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

    updateSourceFilePath(req, res, next) {
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
                        res.status(200).send('Bot was created succsessfully. Source file uploaded. All is ok');
                        next()
                    })
                    .catch(next)
            })
            .catch(next)
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
                    return res.status(200).send(bots)
                } else {
                    return res.status(404).send('No bots with provided user\'s ID was found')
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
                    return res.status(200).send(bots)
                } else {
                    return res.status(404).send('No bots created or updated after given date was found')
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
            //  const { exec } = require('child_process');
            const bareOriginFileName = path.basename(bot.jarFile);
            const bareOriginDirPath = path.dirname(bot.jarFile);
            let fileName = bareOriginFileName + '.gz';
            const fileDir = path.join(bareOriginDirPath, 'archives');
            console.log('fileDir = ', fileDir);
            // exec(fileDir, (error, stdout, stderr) => {
            //     if (error) {
            //         console.error(`exec error: ${error}`);
            //         return;
            //     }
            //     console.log(`stdout: ${stdout}`);
            //     console.log(`stderr: ${stderr}`);
            // });

            const filePath = path.join(fileDir, fileName);
            console.log('filePath = ', filePath);

            const zlib = require('zlib');
            const gzip = zlib.createGzip();
            const temp2 = path.join(bareOriginDirPath, bareOriginFileName);
            console.log('temp2 = ', temp2);
            const inp = fs.createReadStream(temp2);
            const out = fs.createWriteStream(filePath);

            //  res.header('Content-type', 'application/octet-stream');
            inp.pipe(gzip).pipe(out);
  
        })
        .catch(next)
    },

    getBotZippedSourceFile(req, res, next) {
        return Bot
        .findByPk(req.params.id)
        .then(bot => {
            archivator(req, res, bot.jarFile)
        })
        .catch(next)
    },

    showAllBots(req, res, next) {
        return Bot
            .findAll()
            .then(bots => {
                res.status(200).send(bots)
            })
            .catch(next)
    },

// updated dev rating value needs to be passed by updated_dev_rating variable through request body
// type should be real (number with floating dot), not string
    updateDevRating(req, res, next) {
        const updatedDevRating = req.body.updated_dev_rating;
        
        if (updatedDevRating) {
            return Bot
                .findByPk(req.params.id)
                .then(bot => {
                    return bot
                        .update({
                            devRating: updatedDevRating
                        })
                        .then(() => {
                            res.status(200).send('Bot dev rating updated successfully');
                        })
                        .catch(next)
                })
                .catch(next)
        } else {
            res.status(400).send('Dev rating value was not provided');
        }
    },

// updated event rating value needs to be passed by updated_event_rating variable through request body
// type should be real (number with floating dot), not string
    updateEventRating(req, res, next) {
        const updatedEventRating = req.body.updated_event_rating;
        
        if (updatedEventRating) {
            return Bot
                .findByPk(req.params.id)
                .then(bot => {
                    return bot
                        .update({
                            eventRating: updatedEventRating
                        }).then(() => {
                            res.status(200).send('Bot event rating updated successfully');
                        })
                        .catch(next)
                })
                .catch(next)
        } else {
            res.status(400).send('Event rating value was not provided');
        }
    },

    deleteBot(req, res, next) {
        return Bot
            .findByPk(req.params.id)
            .then(bot => {
                if (!bot) {
                    return res.status(404).send('No bot with provided id was founded')
                }
                return bot
                    .destroy()
                    .then(() => res.status(201).send('Bot deleted'))
                    .catch(next)
            })
            .catch(next)
    }
}