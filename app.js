const express = require('express');
const logger = require('morgan');
const app = express();

// Log requests to the console.
app.use(logger('dev'));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Setup a default catch-all route that sends back a welcome message in JSON format.
require('./server/routes')(app);
app.get('*', (req, res) => res.status(200).send({
  message: 'Welcome to the beginning of everything.',
}));

module.exports = app;