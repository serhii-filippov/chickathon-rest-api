'use strict';
const { sequelize, DataTypes } = require('../models/utils');
const bcrypt = require('bcrypt');
const hashConfig = require('../auth/config');

const User = sequelize.define('User', {
  fullName: DataTypes.STRING,
  department: DataTypes.STRING,
  login: DataTypes.STRING,
  password: DataTypes.STRING
}, {});

User.hook('beforeSave', (user, options) => {
  return bcrypt.hash(user.password, hashConfig.saltRounds)
    .then((hash) => {
      user.password = hash;
    })
    .catch(err => {
      console.log('Error occured during creating password (beforeSave). ', err);
    })
});

module.exports = User;