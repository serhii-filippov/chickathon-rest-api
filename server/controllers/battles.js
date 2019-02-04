'use strict';

const BotsBattle = require('../models/botsbattle');
const Bot = require('../models/bot');
const Battle = require('../models/battle');
const path = require('path');

module.exports = {
// this route returns ID of created battle into string
    createBattle(req, res, next) {
// date needs to be passed by dateOfBattle variable through request body in format YYYY-MM-DD GMT
        const { type, bot1Id, bot2Id, dateOfBattle } = req.body;

        return Battle
            .create({
                type: type,
                replayFile: null,
                dateOfBattle: dateOfBattle
            })
            .then(battle => {
                if (battle) {
                    req.createdBattleObject = {
                        id: battle.id,
                        bot1Id: Number(battle.bot1Id),
                        bot2Id: Number(battle.bot2Id)
                    }

                    return BotsBattle
                        .create({
                            botId: bot1Id,
                            battleId: battle.id,
                            result: 0
                        })
                        .then(() => {
                            return BotsBattle
                                .create({
                                    botId: bot2Id,
                                    battleId: battle.id,
                                    result: 0
                                })
                                .then(() => {
                                    res.status(201).json(battle);
                                    // next()
                                })
                                .catch(next)
                        })
                        .catch(next)
                } else {
                    console.log('Some error occured during bot creating in "else" into createBattle func');
                    res.status(400).json(`Some error occured during bot creating`);
                }
            })
            .catch(next)
    },

    replayFileUpload(req, res, next) {
        if (Object.keys(req.files).length == 0) {
            return res.status(400).json('No battle replay file was provided');
        }

// replayFile is the name of the input field in the bot creation form, 
// copy-paste this: input type = "file" name = "replayFile"
// and add ' encType="multipart/form-data" ' (without '') to the form attributes
        const id = req.params.id;

        return Battle
            .findByPk(id)
            .then(battle => {
                const d = new Date(battle.dateOfBattle);
                req.createdBattleObject = {
                    // battleReplayFileName: String(id) + '-' + d.toISOString().split('T')[0] + '.jar',
                    battleReplayFileName: String(id) + '-' + String(d.toISOString().split('T')[0]) + '.jar'
                };
                let replayFile = req.files.replayFile;
                const replayFilePath = path.join('server/files/replays', req.createdBattleObject.battleReplayFileName);

                replayFile.mv(replayFilePath, () => {
                    req.createdBattleObject.replayFilePath = replayFilePath;
                    req.createdBattleObject.id = id;
                    next();
                })
            })
            .catch(next)
    },

    updateBattle(req, res, next) {
        const id = (req.createdBattleObject && req.createdBattleObject.id) || req.params.id;
        const result = (req.body.result && req.body.result) || 10000;
        const replayFile = req.createdBattleObject.replayFilePath;

        return Battle
            .findByPk(id)
            .then(battle => {
                if ((result !== undefined) && (replayFile !== undefined)) {
                    return battle
                        .update({
                            replayFile: replayFile
                        })
                        .then(() => {
                            return BotsBattle
                                .findAndCountAll({
                                    where: {
                                        battleId: id
                                    },
                                    attributes: {
                                        include: ['id']
                                    }
                                })
                                .then(result2 => {
                                    const currentBotsBattleRow1 = result2.rows[0].dataValues.id;
                                    const currentBotsBattleRow2 = result2.rows[1].dataValues.id;
                                    console.log('currentBotsBattleRow1 = ', currentBotsBattleRow1);
                                    console.log('currentBotsBattleRow2 = ', currentBotsBattleRow2);

                                    return BotsBattle
                                        .findByPk(currentBotsBattleRow1)
                                        .then(botsbattle1 => {
                                            return botsbattle1
                                                .update({
                                                    result: result
                                                })
                                                .then(() => {
                                                    return BotsBattle
                                                        .findByPk(currentBotsBattleRow2)
                                                        .then(botsbattle2 => {
                                                            return botsbattle2
                                                                .update({
                                                                    result: result
                                                                })
                                                                .then(() => {
                                                                    res.status(200).json(battle)
                                                                })
                                                                .catch(next)
                                                        })
                                                        .catch(next)
                                                })
                                                .catch(next)
                                        })
                                        .catch(next)
                                })
                                .catch(next)
                        })
                        .catch(next)
                } else if (result !== undefined) {
                    return BotsBattle
                                .findAll({
                                    where: {
                                        battleId: id
                                    }
                                })
                                .then(botsbattles => {
                                    return botsbattles
                                        .update({
                                            result: result
                                        })
                                        .then(() => {
                                            res.status(200).json(battle)
                                        })
                                        .catch(next)
                                })
                                .catch(next)
                } else if (replayFile !== undefined) {
                    return battle
                        .update({
                            replayFile: replayFile
                        })
                        .then(() => res.status(200).json(battle))
                        .catch(next)
                } else {
                    res.status(400).json(`No data was provided (result of battle and/or replay file URI)`)
                }
            })
            .catch(next)
    },

    showBattleDetails(req, res, next) {
        return Battle
            .findOne({
                where: {
                    id: req.params.id
                },
                include: {
                    model: Bot
                }
            })
            .then(battle => {
                if (battle) {
                    return res.status(200).json(battle)
                }
                return res.status(404).json(`Battle with ID ${req.params.id} was not found`);
            })
            .catch(next)
    },

    showAllBattles(req, res, next) {
        return Battle
            .findAll()
            .then(battles => {
                if (battles) {
                    return res.status(200).json(battles)
                }
                return res.status(404).json(`No battles were found. Try create some before display it =)`);
            })
            .catch(next)
    }
}