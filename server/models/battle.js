'use strict';
const { sequelize, DataTypes } = require('./utils');

const Battle = sequelize.define('Battle', {
  type: DataTypes.STRING,
  replayFile: DataTypes.STRING,
  dateOfBattle: DataTypes.DATE
}, {});
 
module.exports = Battle;