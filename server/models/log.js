'use strict';
const { sequelize, DataTypes } = require('./utils');

const Log = sequelize.define('Log', {
  type: DataTypes.STRING,
  content: DataTypes.STRING,
  eventId: DataTypes.INTEGER,
  botId: DataTypes.INTEGER,
  battleId: DataTypes.INTEGER
}, {});

module.exports = Log;