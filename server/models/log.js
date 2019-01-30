'use strict';
const { sequelize, DataTypes } = require('./utils');

const Log = sequelize.define('Log', {
  type: DataTypes.STRING,
  content: DataTypes.STRING,
  status: DataTypes.BOOLEAN,
  eventId: DataTypes.INTEGER,
  botId: DataTypes.INTEGER,
  battleId: DataTypes.INTEGER
}, {});

module.exports = Log;