'use strict';
const { sequelize, DataTypes } = require('./utils');

const BotsBattle = sequelize.define('BotsBattle', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true // Automatically gets converted to SERIAL for postgres
  },
  // botId: DataTypes.INTEGER,
  // battleId: DataTypes.INTEGER,
  result: DataTypes.INTEGER
}, {});

module.exports = BotsBattle;