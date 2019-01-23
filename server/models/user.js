'use strict';
const { sequelize, DataTypes } = require('../models/utils');

const User = sequelize.define('User', {
  fullName: DataTypes.STRING,
  department: DataTypes.STRING,
}, {});

module.exports = User;