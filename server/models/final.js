'use strict';
const { sequelize, DataTypes } = require('./utils');

const Final = sequelize.define('Final', {
  eventId: DataTypes.INTEGER,
  botId: DataTypes.INTEGER,
  position: DataTypes.INTEGER,
  score: DataTypes.REAL
}, {});

module.exports = Final;