'use strict';

const Battle = require('../models/battle');
const path = require('path');

module.exports = {
// this route returns ID of created battle into string
    createBattle(req, res, next) {
// date needs to be passed by dateOfBattle variable through request body in format YYYY-MM-DD GMT
        const { type, bot1Id, bot2Id, result, replayFile, dateOfBattle } = req.body;

        return Battle
            .create({
                type: type,
                bot1Id: bot1Id,
                bot2Id: bot2Id,
                result: result || 'temporary result; real one will be added after end of fight',
                replayFile: replayFile || null,
                dateOfBattle: dateOfBattle
            })
            .then(battle => {
                if (battle) {
                    const d = new Date(dateOfBattle);

                    req.createdBattleObject = {
                        id: battle.id,
                        bot1Id: battle.bot1Id,
                        bot2Id: battle.bot2Id,
                        result: battle.result,
                        // replayFile: battle.replayFile,
                        dateOfBattle: battle.dateOfBattle,
                        battleReplayFileName: String(battle.id) + '-' + d.toISOString().split('T')[0] + '.jar'
                    };
                    next()
                } else {
                    console.log('Some error occured during bot creating in "else" into createBattle func');
                    res.status(400).send(`Some error occured during bot creating`);
                }
            })
            .catch(next)
    },

    replayFileUpload(req, res, next) {
        console.log('зашли в replayFileUpload');
        console.log('req.files = ', req.files);
        if (Object.keys(req.files).length == 0) {
            return res.status(400).send('No battle replay file was provided');
        }

// replayFile is the name of the input field in the bot creation form, 
// just copy-paste this: input type = "file" name = "replayFile"
// need to add ' encType="multipart/form-data" ' (without '') to the form attributes

        let replayFile = req.files.replayFile;
        const replayFilePath = path.join('server/files/replays', req.createdBattleObject.battleReplayFileName);

        replayFile.mv(replayFilePath, () => {
            req.createdBattleObject.replayFilePath = replayFilePath;
            next();
        })        
    },

    updateBattle(req, res, next) {
// have to add battle replay upload function
        const { result } = req.body;
        const replayFile = req.createdBattleObject.replayFilePath;
        const id = req.createdBattleObject.id || req.params.id;

        console.log('result = ' + result + ' replayFile = ' + replayFile + ' id = ' + id);
        return Battle
            .findByPk(id)
            .then(battle => {
                if ((result !== undefined) && (replayFile !== undefined)) {
                    return battle
                        .update({
                            result: result,
                            replayFile: replayFile
                        })
                        .then(() => res.send(`Battle with ID ${id} updated!`))
                        .catch(next)
                } else if (result !== undefined) {
                    return battle
                        .update({
                            result: result
                        })
                        .then(() => res.send(`Battle with ID ${id} updated!`))
                        .catch(next)
                } else if (replayFile !== undefined) {
                    return battle
                        .update({
                            replayFile: replayFile
                        })
                        .then(() => res.send(`Battle with ID ${id} updated!`))
                        .catch(next)
                } else {
                    res.status(400).send(`No data was provided (result of battle and/or replay file URI)`)
                }
            })
            .catch(next)
    },

    showBattleDetails(req, res, next) {
        return Battle
            .findByPk(req.params.id)
            .then(battle => {
                if (battle) {
                    return res.status(200).send(battle)
                }
                return res.status(404).send(`Battle with ID ${req.params.id} was not found`);
            })
            .catch(next)
    },

    showAllBattles(req, res, next) {
        return Battle
            .findAll()
            .then(battles => {
                if (battles) {
                    return res.status(200).send(battles)
                }
                return res.status(404).send(`No battles were found. Try create some before display it =)`);
            })
            .catch(next)
    }
}