'use strict';
const { sequelize, DataTypes } = require('./utils');

const EventFinalist = sequelize.define('EventFinalist', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true // Automatically gets converted to SERIAL for postgres
  },
  // finalistId: DataTypes.INTEGER,
  // eventId: DataTypes.INTEGER
}, {});

module.exports = EventFinalist;