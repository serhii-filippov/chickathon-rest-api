'use strict';
const { sequelize, DataTypes } = require('./utils');

const Battle = sequelize.define('Battle', {
  type: DataTypes.STRING,
  bot1Id: DataTypes.INTEGER,
  bot2Id: DataTypes.INTEGER,
  result: DataTypes.STRING,
  replayFile: DataTypes.STRING,
  dateOfBattle: DataTypes.DATE
}, {});
 
module.exports = Battle;