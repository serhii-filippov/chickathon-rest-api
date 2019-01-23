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

User.hasMany(Bot, {
  through: 'botsBattles'
});
Bot.belongsTo(User, {
  foreignKey: 'userId'
});

Bot.belongsTo(Final);
Bot.belongsToMany(Battle);
Battle.belongsToMany(Bot, {
  // ???
  through: 'botsBattles',
  as: 'bot1',
  foreignKey: 'bot1Id'
});
Battle.belongsToMany(Bot, {
  // ???
  through: 'botsBattles',
  as: 'bot2',
  foreignKey: 'bot2Id'
});''

Log.belongsTo(Bot, {
  foreignKey: 'botId'
});
Log.belongsTo(Battle, {
  foreignKey: 'battleId'
});
Log.belongsTo(Event, {
  foreignKey: 'eventId'
});

// ?????
Event.hasMany(Final, {
  through: 'eventFinalists',
  as: 'finalists1',
  foreignKey: 'firstPlace'
});
Event.hasMany(Final, {
  through: 'eventFinalists',
  as: 'finalists2',
  foreignKey: 'secondPlace'
});
Event.hasMany(Final, {
  through: 'eventFinalists',
  as: 'finalists3',
  foreignKey: 'thirdPlace'
});

Final.hasMany(Event, {
  through: 'eventFinalists',
  foreignKey: 'eventId'
});
Final.hasOne(Bot, {
  foreignKey: 'botId'
});

module.exports = {
  Battle,
  Bot,
  Event,
  Final,
  Log,
  User,
  sync: sequelize.sync.bind(sequelize),
}