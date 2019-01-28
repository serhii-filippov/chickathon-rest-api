'use strict';
const { sequelize, DataTypes } = require('./utils');

const Event = sequelize.define('Event', {
  startDate: DataTypes.DATE,
  endDate: DataTypes.DATE,
  firstPlace: DataTypes.INTEGER,
  secondPlace: DataTypes.INTEGER,
  thirdPlace: DataTypes.INTEGER,
  isEnded: DataTypes.BOOLEAN
}, {});

module.exports = Event;