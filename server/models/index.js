'use strict';

// const fs = require('fs');
// const path = require('path');
// const Sequelize = require('sequelize');
// const basename = path.basename(__filename);
// const env = process.env.NODE_ENV || 'development';
// const config = require(__dirname + '/../config/db.json')[env];
// const db = {};

const { sequelize } = require('./utils');

const Battle = require('./battle');
const Bot = require('./bot');
const Event = require('./event');
const Final = require('./final');
const Log = require('./log');
const User = require('./user');
const BotsBattle = require('./botsbattle');
const EventFinalist = require('./eventfinalist');

Bot.belongsToMany(Battle, {
  through: 'BotsBattle',
  foreignKey: 'botId',
  otherKey: 'battleId'
});
Battle.belongsToMany(Bot, {
  through: 'BotsBattle',
  foreignKey: 'battleId',
  otherKey: 'botId'
});

Bot.belongsTo(User, {
  foreignKey: 'userId'
});

Final.belongsToMany(Event, {
  through: 'EventFinalist',
  foreignKey: 'finalistId',
  otherKey: 'eventId'
});
Event.belongsToMany(Final, {
  through: 'EventFinalist',
  foreignKey: 'eventId',
  otherKey: 'finalistId'
});

Log.belongsTo(Bot, {
  foreignKey: 'botId'
});
Log.belongsTo(Battle, {
  foreignKey: 'battleId'
});
Log.belongsTo(Event, {
  foreignKey: 'eventId'
});

Final.belongsTo(Bot, {
  foreignKey: 'botId'
});

module.exports = {
  Battle,
  Bot,
  Event,
  Final,
  Log,
  User,
  BotsBattle,
  EventFinalist,
  sync: sequelize.sync.bind(sequelize),
} 