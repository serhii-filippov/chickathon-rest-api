'use strict';
const { sequelize, DataTypes } = require('./utils');

const Bot = sequelize.define('Bot', {
  name: DataTypes.STRING,
  userId: DataTypes.INTEGER,
  devLanguage: DataTypes.STRING,
  devRating: DataTypes.REAL,
  eventRating: DataTypes.REAL,
  jarFile: DataTypes.STRING,
  jarFileUpdateDate: DataTypes.DATE
}, {});

module.exports = Bot;