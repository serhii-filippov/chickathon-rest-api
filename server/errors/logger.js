'use strict';

const winston = require('winston');
const winstonLogger = winston.createLogger({
//   level: 'info',
//   format: winston.format.json(),
//   defaultMeta: {service: 'user-service'},
  transports: [
    new winston.transports.File({
        filename: '../logs/error.log',
        level: 'error' 
    }),
    new winston.transports.File({
        filename: '../logs/combined.log'
    })
  ]
});

// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
if (process.env.NODE_ENV !== 'production') {
//   winstonLogger.add(new winston.transports.Console({
//     format: winston.format.simple()
//   }));
}

class WinLogger {
    constructor(){

    }

    static winstonLogging(err, req, res, next){
        winstonLogger.log({
            level: 'error', 
            message: String(err)
        });
        next(err)
    }
}

module.exports = { WinLogger }